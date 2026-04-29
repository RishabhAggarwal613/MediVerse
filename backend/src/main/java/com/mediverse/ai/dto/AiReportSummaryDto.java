package com.mediverse.ai.dto;

import java.time.Instant;

/** List row for patient's report history. */
public record AiReportSummaryDto(
        Long id,
        String originalFilename,
        String summarySnippet,
        String sharedDoctorName,
        Instant createdAt) {}
