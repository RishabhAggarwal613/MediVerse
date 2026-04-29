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
    if (axios.isAxiosError(e) && e.response?.data) {
      unwrapEnvelope(e.response.data as ApiResponse<T>);
    }
    throw e;
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
