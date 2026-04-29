-- Optional practice-location and language hints for patient browse / booking context.
ALTER TABLE doctors
    ADD COLUMN practice_city VARCHAR(120) NULL AFTER bio;

ALTER TABLE doctors
    ADD COLUMN languages VARCHAR(512) NULL AFTER practice_city;
