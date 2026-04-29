import { api } from "@/lib/api/client";
import { fromAxios } from "@/lib/api/unpack";
import type {
  AiChatMessageDto,
  AiChatSessionDto,
  AiHealthTipDto,
  SendAiChatMessagesResponseDto,
} from "@/types/ai";

export function fetchAiChatSessions() {
  return fromAxios<AiChatSessionDto[]>(() => api.get("/ai/chat/sessions"));
}

export function createAiChatSession(body?: { title?: string }) {
  return fromAxios<AiChatSessionDto>(() =>
    api.post("/ai/chat/sessions", body ?? {}),
  );
}

export function fetchAiChatMessages(sessionId: number) {
  return fromAxios<AiChatMessageDto[]>(() =>
    api.get(`/ai/chat/sessions/${sessionId}/messages`),
  );
}

export function sendAiChatMessage(sessionId: number, content: string) {
  return fromAxios<SendAiChatMessagesResponseDto>(() =>
    api.post(`/ai/chat/sessions/${sessionId}/messages`, { content }),
  );
}

export function fetchDailyHealthTip() {
  return fromAxios<AiHealthTipDto>(() => api.get("/ai/health-tip"));
}
