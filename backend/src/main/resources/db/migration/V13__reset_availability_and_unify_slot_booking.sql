-- Cross-modality booking: all time_slots rows sharing (doctor_id, slot_date, start_time) behave
-- as one calendar instant. Sync flags so sibling rows reflect any booked sibling.
--

UPDATE time_slots t
INNER JOIN time_slots booked
    ON t.doctor_id = booked.doctor_id
    AND t.slot_date = booked.slot_date
    AND t.start_time = booked.start_time
SET t.is_booked = TRUE
WHERE booked.is_booked = TRUE
  AND t.is_booked = FALSE;

-- Only orphan frees — FK appointments keeps referenced slots even when historically inconsistent or cancelled.
DELETE t FROM time_slots t
WHERE t.is_booked = FALSE
  AND NOT EXISTS (
    SELECT 1 FROM appointments a WHERE a.time_slot_id = t.id);

DELETE FROM doctor_availability;
