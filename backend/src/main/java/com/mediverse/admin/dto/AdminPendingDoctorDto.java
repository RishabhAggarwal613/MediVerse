package com.mediverse.admin.dto;

import java.time.Instant;

public record AdminPendingDoctorDto(
        long doctorId,
        long userId,
        String fullName,
        String email,
        String licenseNumber,
        String specialization,
        String licenseDocumentUrl,
        Instant createdAt) {}
