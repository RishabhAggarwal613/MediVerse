/** Matches backend {@code AppointmentDto}. */
export interface AppointmentDto {
  id: number;
  status: string;
  scheduledAt: string;
  timeSlotId: number;
  doctorId: number;
  patientId: number;
  patientName: string;
  doctorName: string;
  patientEmail: string;
  doctorEmail: string;
  reason: string | null;
  doctorNote: string | null;
}
