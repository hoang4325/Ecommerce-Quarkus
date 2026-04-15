-- V1.0.0 Create user_profile table
CREATE TABLE IF NOT EXISTS user_profile
(
    id         UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    phone      VARCHAR(20),
    address    TEXT,
    city       VARCHAR(100),
    country    VARCHAR(100),
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_profile_email ON user_profile (email);
