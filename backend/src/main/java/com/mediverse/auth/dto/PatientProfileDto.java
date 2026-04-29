package com.mediverse.auth.dto;

import com.mediverse.user.domain.Gender;
import java.time.LocalDate;

/** Clinical-ish patient fields surfaced on {@link UserDto} for PATIENT accounts. */
public record PatientProfileDto(
        LocalDate dateOfBirth, Gender gender, String bloodGroup, String allergies, String emergencyContact) {}
