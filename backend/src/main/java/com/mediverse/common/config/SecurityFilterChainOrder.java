package com.mediverse.common.config;

/** Order values for multiple {@link org.springframework.security.web.SecurityFilterChain}s. */
public final class SecurityFilterChainOrder {

    private SecurityFilterChainOrder() {}

    /** Google OAuth2 authorization-code endpoints (short-lived session). */
    public static final int OAUTH2 = 0;

    /** Stateless JWT for API and static resources. */
    public static final int API_JWT = 1;
}
