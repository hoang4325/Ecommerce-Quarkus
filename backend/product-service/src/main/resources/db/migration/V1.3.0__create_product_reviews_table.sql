CREATE TABLE IF NOT EXISTS product_review
(
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID         NOT NULL REFERENCES product (id) ON DELETE CASCADE,
    user_id    UUID         NOT NULL,
    user_name  VARCHAR(255),
    rating     INTEGER      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_product_review_product_user UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_review_product_id ON product_review (product_id);
CREATE INDEX IF NOT EXISTS idx_product_review_user_id    ON product_review (user_id);
CREATE INDEX IF NOT EXISTS idx_product_review_rating     ON product_review (rating);
