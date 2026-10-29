CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(150),
    user_role VARCHAR(20),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100),
    entity_id BIGINT,
    details TEXT,
    ip VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_id     ON audit_log(user_id);
CREATE INDEX idx_audit_created_at  ON audit_log(created_at DESC);
CREATE INDEX idx_audit_action      ON audit_log(action);
CREATE INDEX idx_audit_entity      ON audit_log(entity, entity_id);