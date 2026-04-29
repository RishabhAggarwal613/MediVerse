package com.mediverse.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.Size;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CreateAiChatSessionRequest(@Size(max = 200) String title) {}
