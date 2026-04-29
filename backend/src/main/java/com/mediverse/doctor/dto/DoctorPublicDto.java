package com.mediverse.doctor.dto;

import com.mediverse.auth.dto.UserDto;
import java.math.BigDecimal;

public record DoctorPublicDto(
        Long doctorId,
        UserDto practitioner,
        String phone,
        String specialization,
        String qualifications,
        Integer yearsExperience,
        BigDecimal consultationFee,
        String bio,
        String practiceCity,
        String languages,
        boolean verified) {}
