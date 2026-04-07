package com.ecommerce.notification.messaging;

import com.ecommerce.common.event.OrderConfirmedEvent;
import com.ecommerce.common.event.PaymentProcessedEvent;
import com.ecommerce.notification.service.NotificationService;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.jboss.logging.Logger;

/**
 * Kafka consumer: listens for payment-processed and order-confirmed events.
 * Creates notification records for users.
 */
@ApplicationScoped
public class EventConsumer {

    private static final Logger LOG = Logger.getLogger(EventConsumer.class);

    @Inject NotificationService notificationService;

    @Incoming("payment-processed-in")
    public void onPaymentProcessed(PaymentProcessedEvent event) {
        LOG.infof("Received payment-processed for order %s", event.getOrderId());

        String message = event.isSuccess()
                ? String.format("Payment of %s processed successfully for order %s (txn: %s)",
                        event.getAmount(), event.getOrderId(), event.getTransactionId())
                : String.format("Payment failed for order %s: %s", event.getOrderId(), event.getReason());

        notificationService.createNotification(
                event.getUserId(),
                event.isSuccess() ? "PAYMENT_SUCCESS" : "PAYMENT_FAILED",
                message
        );
    }

    @Incoming("order-confirmed-in")
    public void onOrderConfirmed(OrderConfirmedEvent event) {
        LOG.infof("Received order-%s for order %s", event.getStatus(), event.getOrderId());

        String message = "CONFIRMED".equals(event.getStatus())
                ? String.format("Your order %s has been confirmed! Thank you for your purchase.", event.getOrderId())
                : String.format("Order %s has been cancelled. Reason: %s", event.getOrderId(), event.getReason());

        notificationService.createNotification(
                event.getUserId(),
                "ORDER_" + event.getStatus(),
                message
        );
    }
}
