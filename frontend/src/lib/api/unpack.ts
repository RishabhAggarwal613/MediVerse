import axios, { AxiosResponse } from "axios";

import { ApiRequestError } from "@/lib/api/errors";
import type { ApiResponse } from "@/types/api";

function isFailEnvelope(envelope: ApiResponse<unknown>): envelope is ApiResponse<
  never
> & {
  success: false;
  error: NonNullable<ApiResponse<unknown>["error"]>;
} {
  return envelope.success === false && envelope.error !== undefined && envelope.error !== null;
}

/** Returns `data` when `success`; otherwise throws {@link ApiRequestError}. */
export function unwrapEnvelope<T>(envelope: ApiResponse<T>): T {
  if (envelope.success && envelope.data !== undefined && envelope.data !== null) {
    return envelope.data;
  }
  if (isFailEnvelope(envelope)) {
    throw new ApiRequestError(envelope.error);
  }
  throw new Error("Unexpected API response");
}

/** For `ApiResponse<Void>` where `data` is absent on success. */
export function unwrapVoid(envelope: ApiResponse<void>): void {
  if (envelope.success) {
    return;
  }
  if (isFailEnvelope(envelope)) {
    throw new ApiRequestError(envelope.error);
  }
  throw new Error("Unexpected API response");
}

/** Runs an Axios call and maps JSON envelopes (+ HTTP error bodies) to values or {@link ApiRequestError}. */
export async function fromAxios<T>(
  exec: () => Promise<AxiosResponse<unknown>>,
): Promise<T> {
  try {
    const res = await exec();
    return unwrapEnvelope(res.data as ApiResponse<T>);
  } catch (e: unknown) {
    if (!axios.isAxiosError(e)) throw e;
    const payload = e.response?.data;
    if (
      payload !== undefined &&
      payload !== null &&
      typeof payload === "object" &&
      "success" in (payload as Record<string, unknown>)
    ) {
      try {
        return unwrapEnvelope(payload as ApiResponse<T>);
      } catch (inner) {
        throw inner;
      }
    }
    const st = e.response?.status;
    const url = e.config?.url ?? "";
    let extra = "";
    if (typeof payload === "string") {
      extra = payload.slice(0, 400);
    } else if (payload !== undefined && typeof payload !== "object") {
      extra = String(payload).slice(0, 400);
    }
    const base = e.message || "Request failed";
    if (st === undefined || st === null) {
      throw new Error(`${base}${url ? ` (${url})` : ""}`);
    }
    throw new Error(
      `${base} (HTTP ${String(st)})${extra ? ` — ${extra}` : ""}`,
    );
  }
}

export async function fromAxiosVoid(
  exec: () => Promise<AxiosResponse<unknown>>,
): Promise<void> {
  try {
    const res = await exec();
    unwrapVoid(res.data as ApiResponse<void>);
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.data) {
      unwrapVoid(e.response.data as ApiResponse<void>);
    }
    throw e;
  }
}
