CREATE TABLE product_image (
    id UUID PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    product_id UUID REFERENCES product(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_image_product_id ON product_image(product_id);
