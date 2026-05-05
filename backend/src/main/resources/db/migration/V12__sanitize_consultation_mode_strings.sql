-- Normalize any unexpected consultation_mode values (e.g. missed migration) so JPA can map rows.

UPDATE doctor_availability
SET consultation_mode = 'IN_CLINIC'
WHERE consultation_mode NOT IN ('IN_CLINIC', 'VIDEO');

UPDATE time_slots
SET consultation_mode = 'IN_CLINIC'
WHERE consultation_mode NOT IN ('IN_CLINIC', 'VIDEO');

UPDATE appointments
SET consultation_mode = 'IN_CLINIC'
WHERE consultation_mode NOT IN ('IN_CLINIC', 'VIDEO');
