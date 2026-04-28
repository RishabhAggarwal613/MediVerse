package com.mediverse.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound to all {@code jwt.*} properties in {@code application.yml}. Used by the JWT filter and
 * token service introduced in Phase 2.
 */
@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(
        String secret,
        int accessTtlMinutes,
        int refreshTtlDays,
        String issuer) {}
