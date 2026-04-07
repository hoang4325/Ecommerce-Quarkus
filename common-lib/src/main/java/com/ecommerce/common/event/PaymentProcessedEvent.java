package com.ecommerce.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Event produced by payment-service after payment is processed.
 * Consumed by: order-service (update status) + notification-service (notify user)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentProcessedEvent {

    private UUID orderId;
    private UUID userId;
    private BigDecimal amount;
    private boolean success;
    private String transactionId; // mock transaction ID
    private String reason; // null if success
}
