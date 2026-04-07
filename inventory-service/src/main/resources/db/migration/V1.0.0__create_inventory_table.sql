-- V1.0.0 Create inventory table

CREATE TABLE IF NOT EXISTS inventory
(
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id        UUID        NOT NULL UNIQUE,
    product_name      VARCHAR(255) NOT NULL,
    quantity          INTEGER     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER     NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    updated_at        TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory (product_id);
