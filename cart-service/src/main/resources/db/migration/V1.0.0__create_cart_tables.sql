-- V1.0.0 Create cart tables

CREATE TABLE IF NOT EXISTS cart
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL,
    status     VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_status CHECK (status IN ('ACTIVE', 'CHECKED_OUT'))
);

CREATE TABLE IF NOT EXISTS cart_item
(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id      UUID           NOT NULL REFERENCES cart (id) ON DELETE CASCADE,
    product_id   UUID           NOT NULL,
    product_name VARCHAR(255)   NOT NULL,
    price        DECIMAL(12, 2) NOT NULL CHECK (price > 0),
    quantity     INTEGER        NOT NULL CHECK (quantity > 0),
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_user_status ON cart (user_id, status);
CREATE INDEX IF NOT EXISTS idx_cart_item_cart   ON cart_item (cart_id);
