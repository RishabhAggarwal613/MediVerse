import { api } from "@/lib/api/client";
import { fromAxios } from "@/lib/api/unpack";
import type { AppointmentDto } from "@/types/appointments";

export function bookAppointment(body: {
  slotId: number;
  reason?: string;
  /** Should match the slot row's mode; recommended for UX validation. */
  consultationMode?: "IN_CLINIC" | "VIDEO";
}) {
  return fromAxios<AppointmentDto>(() => api.post("/appointments", body));
}

export function fetchMyAppointments(status?: string) {
  return fromAxios<AppointmentDto[]>(() =>
    api.get("/appointments/me", { params: status ? { status } : undefined }),
  );
}

export function fetchAppointment(id: number) {
  return fromAxios<AppointmentDto>(() => api.get(`/appointments/${id}`));
}

export function approveAppointment(id: number) {
  return fromAxios<AppointmentDto>(() => api.patch(`/appointments/${id}/approve`));
}

export function rejectAppointment(id: number) {
  return fromAxios<AppointmentDto>(() => api.patch(`/appointments/${id}/reject`));
}

export function completeAppointment(id: number, body?: { doctorNote?: string }) {
  return fromAxios<AppointmentDto>(() =>
    api.patch(`/appointments/${id}/complete`, body ?? {}),
  );
}

export function cancelAppointment(id: number) {
  return fromAxios<AppointmentDto>(() =>
    api.patch(`/appointments/${id}/cancel`),
  );
}
