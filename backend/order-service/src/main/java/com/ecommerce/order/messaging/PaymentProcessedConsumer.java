package com.ecommerce.order.messaging;

import com.ecommerce.common.event.PaymentProcessedEvent;
import com.ecommerce.order.service.OrderService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

import io.smallrye.reactive.messaging.annotations.Blocking;

/**
 * Kafka consumer: listens for payment-processed events.
 * Updates order status to CONFIRMED or CANCELLED and produces order-confirmed event.
 */
@ApplicationScoped
public class PaymentProcessedConsumer {

    private static final Logger LOG = Logger.getLogger(PaymentProcessedConsumer.class);

    @Inject OrderService orderService;

    @Incoming("payment-processed-in")
    @Blocking
    public void onPaymentProcessed(PaymentProcessedEvent event) {
        LOG.infof("Received payment-processed for order %s (success=%s)", event.getOrderId(), event.isSuccess());
        orderService.handlePaymentResult(event.getOrderId(), event.isSuccess(), event.getReason());
    }
}
