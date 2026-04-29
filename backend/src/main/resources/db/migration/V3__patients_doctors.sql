-- Phase 2: patient and doctor profile tables (1:1 with users).

CREATE TABLE patients (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    user_id             BIGINT          NOT NULL,
    date_of_birth       DATE            NULL,
    gender              ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    blood_group         VARCHAR(5)      NULL,
    allergies           TEXT            NULL,
    emergency_contact   VARCHAR(20)     NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_patients_user_id (user_id),
    CONSTRAINT fk_patients_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE doctors (
    id                      BIGINT          NOT NULL AUTO_INCREMENT,
    user_id                 BIGINT          NOT NULL,
    specialization          VARCHAR(80)     NULL,
    qualifications          VARCHAR(255)    NULL,
    license_number          VARCHAR(80)     NOT NULL,
    years_experience        INT             NULL,
    consultation_fee        DECIMAL(10, 2)  NULL,
    bio                     TEXT            NULL,
    license_doc_url         VARCHAR(500)    NOT NULL,
    verification_status     ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    verification_note       VARCHAR(500)    NULL,
    is_verified             BOOLEAN         NOT NULL DEFAULT FALSE,
    rating_avg              DECIMAL(2, 1)   NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_doctors_user_id (user_id),
    UNIQUE KEY uq_doctors_license_number (license_number),
    KEY idx_doctors_specialization (specialization),
    KEY idx_doctors_verification_status (verification_status),
    KEY idx_doctors_is_verified (is_verified),
    CONSTRAINT fk_doctors_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
