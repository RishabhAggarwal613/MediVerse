package com.mediverse.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiChatSessionDto(Long id, String title, Instant createdAt, Instant updatedAt) {}
