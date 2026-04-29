package com.mediverse.ai.dto;

import jakarta.validation.constraints.Positive;

public record ShareAiReportRequest(@Positive long doctorId) {}
