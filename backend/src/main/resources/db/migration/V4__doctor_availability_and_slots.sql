-- Phase 4: weekly recurring availability + concrete bookable slots (generated).

CREATE TABLE doctor_availability (
    id                       BIGINT       NOT NULL AUTO_INCREMENT,
    doctor_id                BIGINT       NOT NULL,
    day_of_week              VARCHAR(16)  NOT NULL,
    start_time               TIME         NOT NULL,
    end_time                 TIME         NOT NULL,
    slot_duration_minutes    INT          NOT NULL DEFAULT 30,
    requires_approval        BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active                BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at               TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_doctor_avail_doctor_day (doctor_id, day_of_week, is_active),
    CONSTRAINT fk_doctor_avail_doctor FOREIGN KEY (doctor_id)
        REFERENCES doctors (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE time_slots (
    id                 BIGINT       NOT NULL AUTO_INCREMENT,
    doctor_id          BIGINT       NOT NULL,
    slot_date          DATE         NOT NULL,
    start_time         TIME         NOT NULL,
    end_time           TIME         NOT NULL,
    requires_approval  BOOLEAN      NOT NULL DEFAULT FALSE,
    is_booked          BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_doctor_slot (doctor_id, slot_date, start_time),
    KEY idx_slots_doctor_date (doctor_id, slot_date),
    CONSTRAINT fk_time_slots_doctor FOREIGN KEY (doctor_id)
        REFERENCES doctors (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
