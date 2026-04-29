import type { UserDto } from "./api";

export type ScheduleDay =
  | "MON"
  | "TUE"
  | "WED"
  | "THU"
  | "FRI"
  | "SAT"
  | "SUN";

export interface PageResponseDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DoctorSummaryDto {
  doctorId: number;
  fullName: string;
  specialization: string | null;
  consultationFee: number | null;
  profilePictureUrl: string | null;
}

export interface DoctorPublicDto {
  doctorId: number;
  practitioner: UserDto;
  phone: string | null;
  specialization: string | null;
  qualifications: string | null;
  yearsExperience: number | null;
  consultationFee: number | null;
  bio: string | null;
  verified: boolean;
}

export interface SpecializationOptionDto {
  code: string;
  label: string;
}

export interface DoctorAvailabilityRuleDto {
  id: number;
  dayOfWeek: ScheduleDay;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  requiresApproval: boolean;
  active: boolean;
}

export interface TimeSlotItemDto {
  id: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  requiresApproval: boolean;
}

export interface DoctorDashboardStatsDto {
  appointmentsToday: number;
  weekAppointments: number;
  totalPatientsBooked: number;
}
