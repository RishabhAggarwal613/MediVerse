-- Phase 0 placeholder so Flyway has at least one migration to run on first boot.
-- Real schema starts in Phase 2 (V2__init_users.sql, etc.).
CREATE TABLE IF NOT EXISTS _mediverse_bootstrap (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    note        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO _mediverse_bootstrap (note) VALUES ('MediVerse schema bootstrapped.');
