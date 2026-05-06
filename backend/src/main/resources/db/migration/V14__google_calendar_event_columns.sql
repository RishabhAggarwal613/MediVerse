-- Persist Google Calendar linkage for optional delete on cancel/reject.
ALTER TABLE appointments
    ADD COLUMN google_calendar_event_id VARCHAR(512) NULL AFTER meet_join_url,
    ADD COLUMN google_calendar_calendar_id VARCHAR(256) NULL AFTER google_calendar_event_id;
