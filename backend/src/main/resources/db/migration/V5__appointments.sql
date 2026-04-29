-- Phase 5: patient bookings tied to concrete time_slots (hybrid flow: PENDING if approval).

CREATE TABLE appointments (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    patient_id      BIGINT       NOT NULL,
    doctor_id       BIGINT       NOT NULL,
    time_slot_id    BIGINT       NOT NULL,
    status          ENUM('PENDING','CONFIRMED','REJECTED','COMPLETED','CANCELLED') NOT NULL,
    reason          VARCHAR(500) NULL,
    doctor_note     TEXT NULL,
    scheduled_at    DATETIME     NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_appointments_time_slot (time_slot_id),
    KEY idx_appt_patient_status_time (patient_id, status, scheduled_at),
    KEY idx_appt_doctor_status_time (doctor_id, status, scheduled_at),
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id)
        REFERENCES patients (id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id)
        REFERENCES doctors (id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_slot FOREIGN KEY (time_slot_id)
        REFERENCES time_slots (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
