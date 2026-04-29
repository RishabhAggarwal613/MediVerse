package com.mediverse.user.dto;

import com.mediverse.user.domain.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateMeRequest(
        @NotBlank @Size(max = 120) String fullName,
        @Size(max = 24) String phone,
        @Past(message = "date_of_birth must be in the past") LocalDate dateOfBirth,
        Gender gender,
        @Size(max = 5) String bloodGroup,
        @Size(max = 4000) String allergies,
        @Size(max = 20) String emergencyContact) {}
