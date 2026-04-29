package com.mediverse.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record SendAiChatMessagesResponseDto(AiChatMessageDto userMessage, AiChatMessageDto assistantMessage) {}
