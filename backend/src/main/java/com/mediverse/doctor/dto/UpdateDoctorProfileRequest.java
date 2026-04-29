package com.mediverse.doctor.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateDoctorProfileRequest(
        @Size(max = 80) String specialization,
        @Size(max = 2000) String qualifications,
        @Min(0) @Max(80) Integer yearsExperience,
        @DecimalMin(value = "0.00", inclusive = true) BigDecimal consultationFee,
        @Size(max = 2000) String bio,
        @Size(max = 120) String practiceCity,
        @Size(max = 512) String languages) {}
