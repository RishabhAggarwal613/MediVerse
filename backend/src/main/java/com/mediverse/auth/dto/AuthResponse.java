package com.mediverse.auth.dto;

import java.time.Instant;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Instant accessTokenExpiresAt,
        Instant refreshTokenExpiresAt,
        UserDto user) {

    public static AuthResponse of(
            String accessToken,
            String refreshToken,
            Instant accessExpiresAt,
            Instant refreshExpiresAt,
            UserDto user) {
        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                accessExpiresAt,
                refreshExpiresAt,
                user);
    }
}
