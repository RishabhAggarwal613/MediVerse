package com.mediverse.doctor.dto;

import java.math.BigDecimal;

public record DoctorSummaryDto(
        long doctorId,
        String fullName,
        String specialization,
        BigDecimal consultationFee,
        String profilePictureUrl,
        String availabilitySummary) {}
