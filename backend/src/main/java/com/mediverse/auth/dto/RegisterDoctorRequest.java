package com.mediverse.auth.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Doctor signup payload (without the license file). The endpoint takes this
 * as JSON-serialized form data alongside a multipart {@code license} file.
 */
public record RegisterDoctorRequest(
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank
        @Size(min = 8, max = 100)
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "must contain at least one letter and one digit")
        String password,
        @NotBlank @Size(max = 120) String fullName,
        @Size(max = 20) String phone,
        @NotBlank @Size(max = 80) String specialization,
        @Size(max = 255) String qualifications,
        @NotBlank @Size(max = 80) String licenseNumber,
        @Min(0) @Max(80) Integer yearsExperience,
        @DecimalMin(value = "0.00", inclusive = true) BigDecimal consultationFee,
        @Size(max = 2000) String bio) {}
