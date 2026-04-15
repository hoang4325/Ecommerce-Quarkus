-- V1.0.0 Create product tables

CREATE TABLE IF NOT EXISTS category
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product
(
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255)    NOT NULL,
    slug        VARCHAR(280)    NOT NULL UNIQUE,
    description TEXT,
    price       DECIMAL(12, 2)  NOT NULL CHECK (price > 0),
    image_url   VARCHAR(500),
    category_id UUID            REFERENCES category (id) ON DELETE SET NULL,
    active      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_active    ON product (active);
CREATE INDEX IF NOT EXISTS idx_product_category  ON product (category_id);
CREATE INDEX IF NOT EXISTS idx_product_slug      ON product (slug);
