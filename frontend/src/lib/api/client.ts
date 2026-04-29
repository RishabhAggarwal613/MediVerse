import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { getApiBaseUrl } from "@/lib/env";
import { unwrapEnvelope } from "@/lib/api/unpack";
import { useAuthStore } from "@/stores/auth-store";
import type {
  ApiResponse,
  AuthResponsePayload,
} from "@/types/api";

/** In-flight refresh so parallel 401s share one `/auth/refresh`. */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<ApiResponse<AuthResponsePayload>>(
        `${getApiBaseUrl()}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } },
      )
      .then((res) => unwrapEnvelope(res.data))
      .then((payload) => {
        useAuthStore.getState().setSession(payload);
        return payload.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const original =
        error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

      const status = error.response?.status;
      if (!original || status !== 401) {
        return Promise.reject(error);
      }
      if (original._retry) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }
      const url = String(original.url ?? "");
      if (url.includes("/auth/refresh")) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      const refreshTok = useAuthStore.getState().refreshToken;
      if (!refreshTok) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      original._retry = true;
      const access = await refreshAccessToken(refreshTok);
      if (!access) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }
      original.headers.Authorization = `Bearer ${access}`;
      return client(original);
    },
  );

  return client;
}

/** API singleton for MediVerse (Bearer + rotating refresh). No default Content-Type — JSON for objects is set automatically; FormData stays multipart. */
export const api: AxiosInstance = attachInterceptors(
  axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: false,
    validateStatus: (s) => s >= 200 && s < 300,
  }),
);
