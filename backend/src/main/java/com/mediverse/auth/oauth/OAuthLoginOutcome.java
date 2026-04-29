package com.mediverse.auth.oauth;

import com.mediverse.auth.dto.AuthResponse;

/**
 * Result of mapping a Google OIDC principal to MediVerse users and JWTs.
 *
 * @param auth Non-null only when login succeeded with issued tokens.
 * @param errorCode Machine-readable slug for the frontend ({@code oauth/callback?error=}); null on success.
 */
public record OAuthLoginOutcome(AuthResponse auth, String errorCode) {

    public static OAuthLoginOutcome success(AuthResponse auth) {
        return new OAuthLoginOutcome(auth, null);
    }

    public static OAuthLoginOutcome error(String errorCode) {
        return new OAuthLoginOutcome(null, errorCode);
    }

    public boolean isSuccess() {
        return auth != null;
    }
}
