package com.mediverse.auth.dto;

import com.mediverse.storage.StorageService;
import com.mediverse.user.domain.Patient;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;

/**
 * Minimal user view sent inside {@link com.mediverse.auth.dto.AuthResponse AuthResponse}
 * and {@code /api/users/me}.
 *
 * <p>{@link #profilePictureUrl()} is resolved through {@link StorageService#urlFor} so the client
 * always receives an HTTP(S) URL, never an opaque raw key.
 *
 * <p>{@link #patientProfile()} is only populated for PATIENT roles when a Patient row exists.
 */
public record UserDto(
        Long id,
        String email,
        String fullName,
        Role role,
        boolean emailVerified,
        String profilePictureUrl,
        String phone,
        PatientProfileDto patientProfile) {

    public static UserDto from(User user, StorageService storage) {
        return from(user, storage, null);
    }

    /** Resolves stored key → public URL suitable for browsers. */
    public static UserDto from(User user, StorageService storage, Patient patientOrNull) {
        String pic = user.getProfilePicUrl();
        String url =
                pic == null || pic.isBlank() ? null : storage.urlFor(pic);
        PatientProfileDto pp = null;
        if (patientOrNull != null) {
            pp =
                    new PatientProfileDto(
                            patientOrNull.getDateOfBirth(),
                            patientOrNull.getGender(),
                            patientOrNull.getBloodGroup(),
                            patientOrNull.getAllergies(),
                            patientOrNull.getEmergencyContact());
        }
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isEmailVerified(),
                url,
                user.getPhone(),
                pp);
    }
}
