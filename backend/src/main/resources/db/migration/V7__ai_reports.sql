-- Phase 7: AI lab report scans (S3/local key + Gemini Vision output).

CREATE TABLE ai_reports (
    id                      BIGINT       NOT NULL AUTO_INCREMENT,
    patient_id              BIGINT       NOT NULL,
    original_filename       VARCHAR(255) NOT NULL,
    file_url                VARCHAR(500) NOT NULL COMMENT 'Storage key',
    content_type            VARCHAR(80)  NOT NULL,
    summary                 TEXT         NOT NULL,
    key_findings            JSON         NOT NULL,
    recommendations         TEXT         NOT NULL,
    raw_response            JSON         NULL COMMENT 'Gemini response trace',
    shared_with_doctor_id   BIGINT       NULL,
    created_at              TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ai_reports_patient (patient_id),
    KEY idx_ai_reports_shared_doctor (shared_with_doctor_id),
    CONSTRAINT fk_ai_reports_patient FOREIGN KEY (patient_id)
        REFERENCES patients (id) ON DELETE CASCADE,
    CONSTRAINT fk_ai_reports_doctor FOREIGN KEY (shared_with_doctor_id)
        REFERENCES doctors (id) ON DELETE SET NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
