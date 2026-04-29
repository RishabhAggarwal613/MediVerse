import { api } from "@/lib/api/client";
import { fromAxios, fromAxiosVoid } from "@/lib/api/unpack";

import type { AiReportDetailDto, AiReportSummaryDto } from "@/types/ai";

export function fetchAiReports() {
  return fromAxios<AiReportSummaryDto[]>(() => api.get("/ai/reports"));
}

export function fetchAiReport(reportId: number) {
  return fromAxios<AiReportDetailDto>(() => api.get(`/ai/reports/${reportId}`));
}

/** Multipart scan — backend analyzes with Gemini Vision and stores S3/local key + DB row. */
export function scanAiReport(file: File) {
  const body = new FormData();
  body.append("file", file);
  return fromAxios<AiReportDetailDto>(() =>
    api.post("/ai/reports/scan", body),
  );
}

export function shareAiReport(reportId: number, doctorId: number) {
  return fromAxios<AiReportDetailDto>(() =>
    api.post(`/ai/reports/${reportId}/share`, { doctorId }),
  );
}

export function unshareAiReport(reportId: number) {
  return fromAxios<AiReportDetailDto>(() =>
    api.post(`/ai/reports/${reportId}/unshare`),
  );
}

export function deleteAiReport(reportId: number) {
  return fromAxiosVoid(() => api.delete(`/ai/reports/${reportId}`));
}
