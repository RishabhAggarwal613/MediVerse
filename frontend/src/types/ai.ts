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
