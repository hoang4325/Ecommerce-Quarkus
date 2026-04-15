-- V1.0.0 Create payment table
CREATE TABLE IF NOT EXISTS payment
(
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id       UUID           NOT NULL,
    user_id        UUID           NOT NULL,
    amount         DECIMAL(12, 2) NOT NULL,
    status         VARCHAR(20)    NOT NULL,
    transaction_id VARCHAR(100),
    reason         TEXT,
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_order ON payment (order_id);
CREATE INDEX IF NOT EXISTS idx_payment_user  ON payment (user_id);
