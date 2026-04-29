package com.mediverse.ai.dto;

import java.time.Instant;
import java.util.List;

/** Full scan detail. {@code fileDownloadUrl} is unset for doctors when file access is withheld. */
public record AiReportDetailDto(
        Long id,
        String originalFilename,
        String summary,
        List<AiReportFindingDto> keyFindings,
        String recommendations,
        Long sharedDoctorId,
        String sharedDoctorName,
        Instant createdAt,
        String fileDownloadUrl,
        boolean mayManage) {}
