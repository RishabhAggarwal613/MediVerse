package com.mediverse.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record SendAiChatMessageRequest(
        @NotBlank @Size(min = 1, max = 8000, message = "Message must be 1–8000 chars") String content) {}
