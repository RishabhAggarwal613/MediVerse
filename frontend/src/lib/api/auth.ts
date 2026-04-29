import { fromAxios, fromAxiosVoid } from "@/lib/api/unpack";
import { api } from "@/lib/api/client";

import type { AuthResponsePayload, UserDto } from "@/types/api";
import type { DecimalString } from "./types";

/** JSON part of doctor signup (paired with multipart `license` file). */
export interface DoctorRegistrationPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  specialization: string;
  qualifications?: string;
  licenseNumber: string;
  yearsExperience?: number | null;
  consultationFee?: DecimalString | number | null;
  bio?: string;
}

/** Login POST — returns JWT envelope + user. */
export function loginPost(email: string, password: string) {
  return fromAxios<AuthResponsePayload>(() =>
    api.post("/auth/login", { email, password }),
  );
}

export function registerPatient(payload: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}) {
  return fromAxios<AuthResponsePayload>(() =>
    api.post("/auth/register/patient", payload),
  );
}

export function registerDoctor(
  payload: DoctorRegistrationPayload,
  licenseFile: File,
) {
  const form = new FormData();
  form.append("data", JSON.stringify(payload));
  form.append("license", licenseFile);
  return fromAxios<AuthResponsePayload>(() =>
    api.post("/auth/register/doctor", form),
  );
}

export function refreshSession(refreshToken: string) {
  return fromAxios<AuthResponsePayload>(() =>
    api.post("/auth/refresh", { refreshToken }),
  );
}

export function logoutPost(refreshToken: string) {
  return fromAxiosVoid(() =>
    api.post("/auth/logout", { refreshToken }),
  );
}

export function verifyEmailPost(token: string) {
  return fromAxiosVoid(() =>
    api.post("/auth/verify-email", { token }),
  );
}

export function forgotPasswordPost(email: string) {
  return fromAxiosVoid(() =>
    api.post("/auth/forgot-password", { email }),
  );
}

export function resetPasswordPost(token: string, newPassword: string) {
  return fromAxiosVoid(() =>
    api.post("/auth/reset-password", { token, newPassword }),
  );
}

/** Current user (Bearer). */
export function fetchCurrentUser(): Promise<UserDto> {
  return fromAxios<UserDto>(() => api.get("/users/me"));
}
