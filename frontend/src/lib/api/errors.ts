import type { ApiErrorEnvelope } from "@/types/api";

/** Thrown when the HTTP call succeeded but `success: false`. */
export class ApiRequestError extends Error {
  readonly code?: string;

  readonly details?: ApiErrorEnvelope["details"];

  constructor(public readonly envelope: ApiErrorEnvelope) {
    super(envelope.message ?? "Request failed");
    this.code = envelope.code;
    this.details = envelope.details ?? undefined;
    this.name = "ApiRequestError";
  }
}
