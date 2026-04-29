package com.mediverse.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterPatientRequest(
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank
        @Size(min = 8, max = 100)
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "must contain at least one letter and one digit")
        String password,
        @NotBlank @Size(max = 120) String fullName,
        @Size(max = 20) String phone) {}
