-- Phase 2: core users table + auth-related token tables.
-- Append-only — never edit after merge.

CREATE TABLE users (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    email               VARCHAR(180)    NOT NULL,
    password            VARCHAR(255)    NULL,
    full_name           VARCHAR(120)    NOT NULL,
    phone               VARCHAR(20)     NULL,
    role                ENUM('PATIENT', 'DOCTOR') NOT NULL,
    provider            ENUM('LOCAL', 'GOOGLE')   NOT NULL DEFAULT 'LOCAL',
    provider_id         VARCHAR(120)    NULL,
    profile_pic_url     VARCHAR(500)    NULL,
    email_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
    email_verified_at   TIMESTAMP       NULL,
    enabled             BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_provider_provider_id (provider, provider_id),
    KEY idx_users_role (role)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Refresh tokens are stored as a SHA-256 hash (never plaintext) so a DB dump
-- can't be replayed against the API. Plaintext lives only in the response JSON.
CREATE TABLE refresh_tokens (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    token_hash  VARCHAR(64)     NOT NULL,
    expires_at  TIMESTAMP       NOT NULL,
    revoked     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_refresh_tokens_token_hash (token_hash),
    KEY idx_refresh_tokens_user_id (user_id),
    KEY idx_refresh_tokens_expires_at (expires_at),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE email_verification_tokens (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    token_hash  VARCHAR(64)     NOT NULL,
    expires_at  TIMESTAMP       NOT NULL,
    used_at     TIMESTAMP       NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_email_verif_tokens_token_hash (token_hash),
    KEY idx_email_verif_tokens_user_id (user_id),
    CONSTRAINT fk_email_verif_tokens_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE password_reset_tokens (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    user_id     BIGINT          NOT NULL,
    token_hash  VARCHAR(64)     NOT NULL,
    expires_at  TIMESTAMP       NOT NULL,
    used_at     TIMESTAMP       NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pwd_reset_tokens_token_hash (token_hash),
    KEY idx_pwd_reset_tokens_user_id (user_id),
    CONSTRAINT fk_pwd_reset_tokens_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
