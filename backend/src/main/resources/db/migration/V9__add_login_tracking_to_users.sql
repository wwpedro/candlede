ALTER TABLE users
    ADD COLUMN last_login_ip VARCHAR(45),
    ADD COLUMN last_login_at TIMESTAMP;

CREATE INDEX idx_users_last_login ON users(last_login_at);