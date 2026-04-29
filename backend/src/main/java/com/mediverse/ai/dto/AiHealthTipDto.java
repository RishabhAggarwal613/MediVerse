package com.mediverse.ai.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AiHealthTipDto(String tip, String dayUtc, String timezone) {}
