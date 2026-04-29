-- Phase 6: AI chat sessions & messages for PATIENT Gemini assistant.

CREATE TABLE ai_chat_sessions (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    user_id      BIGINT NOT NULL,
    title        VARCHAR(200) DEFAULT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ai_chat_sessions_user (user_id),
    CONSTRAINT fk_ai_chat_sessions_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE ai_chat_messages (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    session_id BIGINT NOT NULL,
    role        ENUM('USER', 'ASSISTANT') NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ai_chat_messages_session (session_id),
    CONSTRAINT fk_ai_chat_messages_session FOREIGN KEY (session_id)
        REFERENCES ai_chat_sessions (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
