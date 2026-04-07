package com.ecommerce.inventory.messaging;

import com.ecommerce.common.event.OrderCreatedEvent;
import com.ecommerce.common.event.StockReservedEvent;
import com.ecommerce.common.event.Topics;
import com.ecommerce.inventory.service.InventoryService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Kafka consumer: listens for order-created events.
 * Tries to reserve stock, then produces stock-reserved event.
 */
@ApplicationScoped
public class OrderCreatedConsumer {

    private static final Logger LOG = Logger.getLogger(OrderCreatedConsumer.class);

    @Inject InventoryService inventoryService;

    @Channel("stock-reserved-out")
    Emitter<StockReservedEvent> stockReservedEmitter;

    @Incoming("order-created-in")
    public void onOrderCreated(OrderCreatedEvent event) {
        LOG.infof("Received order-created event for order %s", event.getOrderId());

        StockReservedEvent result = inventoryService.reserveStock(event);

        stockReservedEmitter.send(result);
        LOG.infof("Produced stock-reserved event for order %s (success=%s)", result.getOrderId(), result.isSuccess());
    }
}
