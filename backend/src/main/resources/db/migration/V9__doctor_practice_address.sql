-- Practice location for maps / navigation (doctor-editable; optional).

ALTER TABLE doctors
    ADD COLUMN practice_address_formatted VARCHAR(500) NULL AFTER practice_city,
    ADD COLUMN practice_latitude DECIMAL(11, 8) NULL AFTER practice_address_formatted,
    ADD COLUMN practice_longitude DECIMAL(11, 8) NULL AFTER practice_latitude,
    ADD COLUMN practice_place_id VARCHAR(256) NULL AFTER practice_longitude;
