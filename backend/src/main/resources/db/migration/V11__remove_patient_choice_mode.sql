-- Retire PATIENT_CHOICE: only IN_CLINIC and VIDEO remain. Historical rows become IN_CLINIC.

UPDATE doctor_availability SET consultation_mode = 'IN_CLINIC' WHERE consultation_mode = 'PATIENT_CHOICE';

UPDATE time_slots SET consultation_mode = 'IN_CLINIC' WHERE consultation_mode = 'PATIENT_CHOICE';

UPDATE appointments SET consultation_mode = 'IN_CLINIC' WHERE consultation_mode = 'PATIENT_CHOICE';
