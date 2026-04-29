package com.mediverse.auth.dto;

import com.mediverse.storage.StorageService;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;

/**
 * Minimal user view sent inside {@link com.mediverse.auth.dto.AuthResponse AuthResponse}
 * and {@code /api/users/me}.
 *
 * <p>{@link #profilePictureUrl()} is resolved through {@link StorageService#urlFor} so the client
 * always receives an HTTP(S) URL, never an opaque raw key.
 */
public record UserDto(
        Long id,
        String email,
        String fullName,
        Role role,
        boolean emailVerified,
        String profilePictureUrl) {

    /** Resolves stored key → public URL suitable for browsers. */
    public static UserDto from(User user, StorageService storage) {
        String pic = user.getProfilePicUrl();
        String url =
                pic == null || pic.isBlank() ? null : storage.urlFor(pic);
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.isEmailVerified(),
                url);
    }
}
