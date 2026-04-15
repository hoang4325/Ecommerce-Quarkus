package com.ecommerce.common.event;

/**
 * Kafka topic name constants shared across producers and consumers.
 */
public final class Topics {

    public static final String ORDER_CREATED      = "order-created";
    public static final String STOCK_RESERVED     = "stock-reserved";
    public static final String PAYMENT_PROCESSED  = "payment-processed";
    public static final String ORDER_CONFIRMED    = "order-confirmed";

    private Topics() {}
}
