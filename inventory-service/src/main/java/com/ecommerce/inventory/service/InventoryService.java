package com.ecommerce.inventory.service;

import com.ecommerce.common.event.OrderCreatedEvent;
import com.ecommerce.common.event.StockReservedEvent;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.inventory.dto.CreateInventoryRequest;
import com.ecommerce.inventory.dto.InventoryDTO;
import com.ecommerce.inventory.entity.Inventory;
import com.ecommerce.inventory.repository.InventoryRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class InventoryService {

    private static final Logger LOG = Logger.getLogger(InventoryService.class);

    @Inject InventoryRepository inventoryRepository;

    public List<InventoryDTO> findAll() {
        return inventoryRepository.listAll().stream().map(this::toDTO).toList();
    }

    public InventoryDTO findByProductId(UUID productId) {
        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "productId", productId));
        return toDTO(inv);
    }

    @Transactional
    public InventoryDTO create(CreateInventoryRequest request) {
        if (inventoryRepository.findByProductId(request.getProductId()).isPresent()) {
            throw new BusinessException("Inventory entry already exists for product " + request.getProductId());
        }
        Inventory inv = new Inventory();
        inv.setProductId(request.getProductId());
        inv.setProductName(request.getProductName());
        inv.setQuantity(request.getQuantity());
        inv.setReservedQuantity(0);
        inventoryRepository.persist(inv);
        LOG.infof("Created inventory for product %s: qty=%d", request.getProductName(), request.getQuantity());
        return toDTO(inv);
    }

    @Transactional
    public InventoryDTO updateStock(UUID productId, int newQuantity) {
        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "productId", productId));
        inv.setQuantity(newQuantity);
        LOG.infof("Updated stock for product %s: qty=%d", inv.getProductName(), newQuantity);
        return toDTO(inv);
    }

    /**
     * Try to reserve stock for all items in an order.
     * Returns a StockReservedEvent indicating success or failure.
     */
    @Transactional
    public StockReservedEvent reserveStock(OrderCreatedEvent event) {
        for (OrderCreatedEvent.OrderItemEvent item : event.getItems()) {
            var optInv = inventoryRepository.findByProductId(item.getProductId());
            if (optInv.isEmpty()) {
                LOG.warnf("No inventory for product %s — order %s rejected", item.getProductId(), event.getOrderId());
                return StockReservedEvent.builder()
                        .orderId(event.getOrderId())
                        .userId(event.getUserId())
                        .success(false)
                        .reason("Product " + item.getProductName() + " not found in inventory")
                        .build();
            }
            Inventory inv = optInv.get();
            if (inv.getAvailable() < item.getQuantity()) {
                LOG.warnf("Insufficient stock for %s (%d available, %d requested) — order %s",
                        item.getProductName(), inv.getAvailable(), item.getQuantity(), event.getOrderId());
                return StockReservedEvent.builder()
                        .orderId(event.getOrderId())
                        .userId(event.getUserId())
                        .success(false)
                        .reason("Insufficient stock for " + item.getProductName())
                        .build();
            }
        }

        // All checks passed — reserve
        for (OrderCreatedEvent.OrderItemEvent item : event.getItems()) {
            Inventory inv = inventoryRepository.findByProductId(item.getProductId()).get();
            inv.setReservedQuantity(inv.getReservedQuantity() + item.getQuantity());
        }

        LOG.infof("Stock reserved for order %s", event.getOrderId());
        return StockReservedEvent.builder()
                .orderId(event.getOrderId())
                .userId(event.getUserId())
                .success(true)
                .build();
    }

    private InventoryDTO toDTO(Inventory inv) {
        return InventoryDTO.builder()
                .id(inv.getId())
                .productId(inv.getProductId())
                .productName(inv.getProductName())
                .quantity(inv.getQuantity())
                .reservedQuantity(inv.getReservedQuantity())
                .available(inv.getAvailable())
                .build();
    }
}
