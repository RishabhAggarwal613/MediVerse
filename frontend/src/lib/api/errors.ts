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

/** Stable copy for JSX when TanStack exposes `unknown` errors. */
export function unwrapApiErrorMessage(e: unknown): string {
  if (e instanceof ApiRequestError) {
    return e.message;
  }
  if (typeof e === "object" && e !== null) {
    const d = e as { name?: string; message?: string; envelope?: { message?: string } };
    if (d.name === "ApiRequestError" && typeof d.message === "string" && d.message.length > 0) {
      return d.message;
    }
    if (typeof d.envelope?.message === "string" && d.envelope.message.length > 0) {
      return d.envelope.message;
    }
  }
  if (e instanceof Error) {
    return e.message || "Request failed";
  }
  if (typeof e === "string") {
    return e;
  }
  return "Something went wrong.";
}
