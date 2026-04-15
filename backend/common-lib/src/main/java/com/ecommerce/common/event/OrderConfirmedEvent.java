package com.ecommerce.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Event produced by order-service when order is confirmed or cancelled.
 * Consumed by: notification-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderConfirmedEvent {

    private UUID orderId;
    private UUID userId;
    private String status; // CONFIRMED or CANCELLED
    private String reason; // null if confirmed
}
