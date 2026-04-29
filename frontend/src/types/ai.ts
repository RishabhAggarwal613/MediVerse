/** Mirrors backend ai DTOs (Phase 6). */

export interface AiChatSessionDto {
  id: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiChatMessageDto {
  id: number;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface AiHealthTipDto {
  tip: string;
  dayUtc: string;
  timezone: string;
}

export interface SendAiChatMessagesResponseDto {
  userMessage: AiChatMessageDto;
  assistantMessage: AiChatMessageDto;
}

/** Phase 7 — AI lab report scans */
export interface AiReportFindingDto {
  label: string;
  value: string;
  unit: string;
  refRange: string;
  flag: string;
}

export interface AiReportSummaryDto {
  id: number;
  originalFilename: string;
  summarySnippet: string;
  sharedDoctorName: string | null;
  createdAt: string;
}

export interface AiReportDetailDto {
  id: number;
  originalFilename: string;
  summary: string;
  keyFindings: AiReportFindingDto[];
  recommendations: string;
  sharedDoctorId: number | null;
  sharedDoctorName: string | null;
  createdAt: string;
  fileDownloadUrl: string | null;
  mayManage: boolean;
}
