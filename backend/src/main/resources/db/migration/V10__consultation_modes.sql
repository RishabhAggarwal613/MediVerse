-- In-clinic vs video consultations: separate availability rows + composite unique slots.

ALTER TABLE doctors
    ADD COLUMN offers_in_clinic BOOLEAN NOT NULL DEFAULT TRUE AFTER is_verified,
    ADD COLUMN offers_video    BOOLEAN NOT NULL DEFAULT TRUE AFTER offers_in_clinic;

ALTER TABLE doctor_availability
    ADD COLUMN consultation_mode VARCHAR(16) NOT NULL DEFAULT 'IN_CLINIC' AFTER doctor_id;

ALTER TABLE time_slots
    DROP INDEX uq_doctor_slot,
    ADD COLUMN consultation_mode VARCHAR(16) NOT NULL DEFAULT 'IN_CLINIC' AFTER requires_approval;

CREATE UNIQUE INDEX uq_doctor_slot_mode
    ON time_slots (doctor_id, slot_date, start_time, consultation_mode);

ALTER TABLE appointments
    ADD COLUMN consultation_mode VARCHAR(16) NOT NULL DEFAULT 'IN_CLINIC' AFTER doctor_note,
    ADD COLUMN meet_join_url VARCHAR(1024) NULL AFTER consultation_mode,
    ADD COLUMN calendly_event_uri VARCHAR(512) NULL AFTER meet_join_url,
    ADD COLUMN calendly_invitee_uri VARCHAR(512) NULL AFTER calendly_event_uri;
