package com.ecommerce.order.service;

import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.common.event.OrderConfirmedEvent;
import com.ecommerce.common.event.OrderCreatedEvent;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.order.client.CartServiceClient;
import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.dto.OrderDTO;
import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderItem;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.mapper.OrderMapper;
import com.ecommerce.order.repository.OrderRepository;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class OrderService {

    private static final Logger LOG = Logger.getLogger(OrderService.class);

    @Inject OrderRepository orderRepository;
    @Inject OrderMapper orderMapper;
    @RestClient CartServiceClient cartServiceClient;

    @Channel("order-created-out")
    Emitter<OrderCreatedEvent> orderCreatedEmitter;

    @Channel("order-confirmed-out")
    Emitter<OrderConfirmedEvent> orderConfirmedEmitter;

    public List<OrderDTO> findByUser(UUID userId) {
        return orderRepository.findByUserId(userId)
                .stream().map(orderMapper::toDTO).toList();
    }

    public OrderDTO findByIdAndUser(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdOptional(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("Order does not belong to current user", 403);
        }
        return orderMapper.toDTO(order);
    }

    public PagedResponse<OrderDTO> findAllPaged(int page, int size, OrderStatus status) {
        var q = orderRepository.findAllPaged(Page.of(page, size), status);
        long total = q.count();
        var orders = q.list().stream().map(orderMapper::toDTO).toList();
        return PagedResponse.of(orders, page, size, total);
    }

    /**
     * Creates an order from the user's active cart.
     * Flow:
     * 1. Fetch active cart from cart-service
     * 2. Validate cart is not empty
     * 3. Persist order + order items (price snapshot)
     * 4. Ask cart-service to clear the cart
     * 5. [Phase 3] Produce order-created Kafka event for inventory-service
     */
    @Transactional
    public OrderDTO createFromCart(UUID userId, CreateOrderRequest request) {
        // 1. Fetch active cart
        var cartResponse = cartServiceClient.getCart();
        if (cartResponse == null || cartResponse.data() == null) {
            throw new BusinessException("No active cart found");
        }
        var cart = cartResponse.data();

        if (cart.items() == null || cart.items().isEmpty()) {
            throw new BusinessException("Cannot create order from an empty cart");
        }

        // 2. Build order
        Order order = new Order();
        order.setUserId(userId);
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(OrderStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderCreatedEvent.OrderItemEvent> eventItems = new java.util.ArrayList<>();

        for (var item : cart.items()) {
            OrderItem oi = new OrderItem(
                    order,
                    item.productId(),
                    item.productName(),
                    item.price(),
                    item.quantity());
            order.getItems().add(oi);
            total = total.add(item.price().multiply(BigDecimal.valueOf(item.quantity())));

            eventItems.add(OrderCreatedEvent.OrderItemEvent.builder()
                    .productId(item.productId())
                    .productName(item.productName())
                    .price(item.price())
                    .quantity(item.quantity())
                    .build());
        }
        order.setTotalAmount(total);

        // 3. Persist
        orderRepository.persist(order);
        LOG.infof("Order %s created for user %s, total=%s", order.getId(), userId, total);

        // 4. Clear cart (best-effort — order is already persisted)
        try {
            cartServiceClient.clearCart();
        } catch (Exception e) {
            LOG.warnf("Failed to clear cart after order creation: %s", e.getMessage());
        }

        // 5. [Phase 3] Produce Kafka event
        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(order.getId())
                .userId(userId)
                .totalAmount(total)
                .shippingAddress(request.getShippingAddress())
                .items(eventItems)
                .build();
        orderCreatedEmitter.send(event);
        LOG.infof("Produced order-created event for order %s", order.getId());

        return orderMapper.toDTO(order);
    }

    @Transactional
    public OrderDTO cancel(UUID orderId, UUID userId) {
        Order order = orderRepository.findByIdOptional(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getUserId().equals(userId)) {
            throw new BusinessException("Order does not belong to current user", 403);
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Only PENDING orders can be cancelled");
        }
        order.setStatus(OrderStatus.CANCELLED);
        LOG.infof("Order %s cancelled by user %s", orderId, userId);

        // Produce order-confirmed (cancelled) event
        orderConfirmedEmitter.send(OrderConfirmedEvent.builder()
                .orderId(orderId).userId(userId).status("CANCELLED").reason("Cancelled by user").build());

        return orderMapper.toDTO(order);
    }

    @Transactional
    public OrderDTO updateStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findByIdOptional(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        order.setStatus(newStatus);
        LOG.infof("Order %s status updated to %s", orderId, newStatus);
        return orderMapper.toDTO(order);
    }

    /**
     * Called by the PaymentProcessedConsumer to confirm or cancel the order
     * after payment result is received from Kafka.
     */
    @Transactional
    public void handlePaymentResult(UUID orderId, boolean paymentSuccess, String reason) {
        orderRepository.findByIdOptional(orderId).ifPresent(order -> {
            if (paymentSuccess) {
                order.setStatus(OrderStatus.CONFIRMED);
                LOG.infof("Order %s CONFIRMED after successful payment", orderId);
                orderConfirmedEmitter.send(OrderConfirmedEvent.builder()
                        .orderId(orderId).userId(order.getUserId()).status("CONFIRMED").build());
            } else {
                order.setStatus(OrderStatus.CANCELLED);
                LOG.warnf("Order %s CANCELLED due to payment failure: %s", orderId, reason);
                orderConfirmedEmitter.send(OrderConfirmedEvent.builder()
                        .orderId(orderId).userId(order.getUserId()).status("CANCELLED").reason(reason).build());
            }
        });
    }
}
