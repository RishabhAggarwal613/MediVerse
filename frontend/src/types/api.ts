/** Mirrors backend {@code com.mediverse.common.api.ApiError.ErrorCode}. */
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "CONFLICT"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "RATE_LIMITED"
  | "UPSTREAM_UNAVAILABLE"
  | "INTERNAL_ERROR";

export interface FieldViolation {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ApiErrorEnvelope {
  code: ErrorCode;
  message: string;
  details?: FieldViolation[] | null;
  path?: string | null;
  timestamp?: string | null;
}

/** Backend {@link com.mediverse.common.api.ApiResponse}. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T | null;
  error?: ApiErrorEnvelope | null;
}

export type Role = "PATIENT" | "DOCTOR";

export type Gender = "MALE" | "FEMALE" | "OTHER";

/** Patient clinical extras (only on PATIENT accounts with a patient row). */
export interface PatientProfileDto {
  dateOfBirth: string | null;
  gender: Gender | null;
  bloodGroup: string | null;
  allergies: string | null;
  emergencyContact: string | null;
}

/** Auth user shape from `/api/auth/*` responses. */
export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  emailVerified: boolean;
  profilePictureUrl: string | null;
  phone: string | null;
  patientProfile: PatientProfileDto | null;
  /** True when email is listed in backend `ADMIN_EMAILS` (doctor verification queue). */
  admin?: boolean;
}

export interface OnboardingItemDto {
  id: string;
  label: string;
  complete: boolean;
}

export interface OnboardingDto {
  items: OnboardingItemDto[];
  completedCount: number;
  totalCount: number;
}

export interface AdminPendingDoctorDto {
  doctorId: number;
  userId: number;
  fullName: string;
  email: string;
  licenseNumber: string;
  specialization: string | null;
  licenseDocumentUrl: string | null;
  createdAt: string;
}

export interface AuthResponsePayload {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: UserDto;
}
