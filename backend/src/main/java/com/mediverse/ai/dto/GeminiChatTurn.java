package com.mediverse.ai.dto;

import com.mediverse.ai.domain.AiMessageRole;

/** Maps DB roles {@link AiMessageRole} to Gemini {@code generateContent.contents} ordering. */
public record GeminiChatTurn(AiMessageRole role, String text) {

    public String geminiRole() {
        return role == AiMessageRole.USER ? "user" : "model";
    }
}
