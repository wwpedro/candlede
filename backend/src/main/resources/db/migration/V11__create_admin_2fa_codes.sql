CREATE TABLE admin_2fa_codes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_2fa_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);
CREATE INDEX idx_2fa_user ON admin_2fa_codes(user_id);
CREATE INDEX idx_2fa_expires ON admin_2fa_codes(expires_at);