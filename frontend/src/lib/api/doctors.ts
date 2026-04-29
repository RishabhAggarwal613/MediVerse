import { fromAxios, fromAxiosVoid } from "@/lib/api/unpack";
import { api } from "@/lib/api/client";

import type {
  DoctorAvailabilityRuleDto,
  DoctorDashboardStatsDto,
  DoctorPublicDto,
  DoctorSummaryDto,
  PageResponseDto,
  SpecializationOptionDto,
  TimeSlotItemDto,
} from "@/types/doctors";

export function fetchSpecializations() {
  return fromAxios<SpecializationOptionDto[]>(() =>
    api.get("/doctors/specializations"),
  );
}

export function searchDoctors(params: {
  q?: string;
  specialization?: string;
  page?: number;
  size?: number;
}) {
  return fromAxios<PageResponseDto<DoctorSummaryDto>>(() =>
    api.get("/doctors", {
      params: {
        q: params.q || undefined,
        specialization: params.specialization || undefined,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }),
  );
}

export function fetchDoctorPublic(doctorId: number) {
  return fromAxios<DoctorPublicDto>(() => api.get(`/doctors/${doctorId}`));
}

export function fetchDoctorAvailabilityPublic(doctorId: number) {
  return fromAxios<DoctorAvailabilityRuleDto[]>(() =>
    api.get(`/doctors/${doctorId}/availability`),
  );
}

export function fetchDoctorSlots(doctorId: number, date: string) {
  return fromAxios<TimeSlotItemDto[]>(() =>
    api.get(`/doctors/${doctorId}/slots`, {
      params: { date },
    }),
  );
}

/** Logged-in doctor — own profile. */
export function fetchMyDoctorProfile() {
  return fromAxios<DoctorPublicDto>(() => api.get("/doctors/me/profile"));
}

export function updateMyDoctorProfile(body: {
  specialization?: string;
  qualifications?: string;
  yearsExperience?: number | null;
  consultationFee?: number | null;
  bio?: string;
  practiceCity?: string;
  languages?: string;
}) {
  return fromAxios<DoctorPublicDto>(() =>
    api.put("/doctors/me/profile", body),
  );
}

export function fetchDoctorDashboardStats() {
  return fromAxios<DoctorDashboardStatsDto>(() =>
    api.get("/doctors/me/dashboard/stats"),
  );
}

export function fetchMyAvailabilityRules() {
  return fromAxios<DoctorAvailabilityRuleDto[]>(() =>
    api.get("/doctors/me/availability"),
  );
}

export function addAvailabilityRule(body: {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  requiresApproval: boolean;
}) {
  return fromAxios<DoctorAvailabilityRuleDto>(() =>
    api.post("/doctors/me/availability", body),
  );
}

export function updateAvailabilityRule(
  ruleId: number,
  body: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    requiresApproval: boolean;
  },
) {
  return fromAxios<DoctorAvailabilityRuleDto>(() =>
    api.put(`/doctors/me/availability/${ruleId}`, body),
  );
}

export function deleteAvailabilityRule(ruleId: number) {
  return fromAxiosVoid(() =>
    api.delete(`/doctors/me/availability/${ruleId}`),
  );
}
