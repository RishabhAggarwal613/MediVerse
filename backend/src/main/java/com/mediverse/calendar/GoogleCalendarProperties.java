package com.mediverse.calendar;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Optional Google Calendar API integration (service account or OAuth refresh token).
 *
 * <p>Enable {@code mediverse.google-calendar.enabled=true} and configure one auth path.
 */
@ConfigurationProperties(prefix = "mediverse.google-calendar")
public record GoogleCalendarProperties(
        boolean enabled,
        /** Shown in Google Cloud audit / consent screens. */
        String applicationName,
        /**
         * Resource path to service account JSON (e.g. {@code file:/path/key.json} or {@code
         * classpath:google-calendar-sa.json}).
         */
        String serviceAccountJsonPath,
        /** Google Workspace only: user email to impersonate when using a service account. */
        String delegatedUser,
        /**
         * Target calendar for event inserts. Use {@code primary} for OAuth / delegated user, or the
         * service account email when not using delegation.
         */
        String calendarId,
        String oauthClientId,
        String oauthClientSecret,
        String oauthRefreshToken) {

    public boolean oauthConfigured() {
        return oauthRefreshToken != null
                && !oauthRefreshToken.isBlank()
                && oauthClientId != null
                && !oauthClientId.isBlank()
                && oauthClientSecret != null
                && !oauthClientSecret.isBlank();
    }

    public boolean serviceAccountConfigured() {
        return serviceAccountJsonPath != null && !serviceAccountJsonPath.isBlank();
    }
}
