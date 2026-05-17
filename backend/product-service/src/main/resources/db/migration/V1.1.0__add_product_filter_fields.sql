-- V1.1.0 Add fields used by advanced product filters

ALTER TABLE product
    ADD COLUMN IF NOT EXISTS color VARCHAR(64),
    ADD COLUMN IF NOT EXISTS product_size VARCHAR(64),
    ADD COLUMN IF NOT EXISTS dress_style VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_product_price        ON product (price);
CREATE INDEX IF NOT EXISTS idx_product_color        ON product (color);
CREATE INDEX IF NOT EXISTS idx_product_size         ON product (product_size);
CREATE INDEX IF NOT EXISTS idx_product_dress_style  ON product (dress_style);
