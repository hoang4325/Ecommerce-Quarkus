-- V1.0.0 Create order tables

CREATE TABLE IF NOT EXISTS orders
(
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID           NOT NULL,
    total_amount     DECIMAL(12, 2) NOT NULL CHECK (total_amount >= 0),
    status           VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    shipping_address TEXT           NOT NULL,
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_order_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED'))
);

CREATE TABLE IF NOT EXISTS order_item
(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID           NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id   UUID           NOT NULL,
    product_name VARCHAR(255)   NOT NULL,
    price        DECIMAL(12, 2) NOT NULL CHECK (price > 0),
    quantity     INTEGER        NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders (status);
CREATE INDEX IF NOT EXISTS idx_order_item_order ON order_item (order_id);
