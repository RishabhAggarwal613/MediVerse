import { fromAxios, fromAxiosVoid } from "@/lib/api/unpack";
import { api } from "@/lib/api/client";

import type { AdminPendingDoctorDto } from "@/types/api";
import type { PageResponseDto } from "@/types/doctors";

export function fetchPendingDoctors(page = 0, size = 20) {
  return fromAxios<PageResponseDto<AdminPendingDoctorDto>>(() =>
    api.get("/admin/doctors/pending", { params: { page, size } }),
  );
}

export function approveDoctor(doctorId: number) {
  return fromAxiosVoid(() => api.post(`/admin/doctors/${doctorId}/approve`));
}

export function rejectDoctor(doctorId: number, reason?: string | null) {
  return fromAxiosVoid(() =>
    api.post(`/admin/doctors/${doctorId}/reject`, { reason: reason ?? null }),
  );
}
