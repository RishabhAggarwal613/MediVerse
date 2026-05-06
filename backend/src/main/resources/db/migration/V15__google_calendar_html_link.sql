-- Google Calendar event URL (from API) for opening the event in-browser; cleared on cancel/reject.
ALTER TABLE appointments
    ADD COLUMN google_calendar_html_link VARCHAR(2048) NULL AFTER google_calendar_calendar_id;
