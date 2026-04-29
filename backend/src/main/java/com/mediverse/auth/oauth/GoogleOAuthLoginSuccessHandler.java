package com.mediverse.auth.oauth;

import com.mediverse.auth.dto.AuthResponse;
import com.mediverse.auth.service.AuthService;
import com.mediverse.common.config.properties.AppProperties;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

/**
 * Issues MediVerse JWT + refresh tokens and redirects the browser to the SPA OAuth callback URL.
 *
 * <p>Query params on success: {@code token}, {@code refresh}, {@code expires_at} (ISO-8601 access
 * expiry).
 *
 * <p>On logical failure, {@code error=<code>} is set instead.
 */
@Component
@Conditional(GoogleOAuthCredentialsPresent.class)
@RequiredArgsConstructor
public class GoogleOAuthLoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final AppProperties appProperties;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {

        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            redirectError(request, response, "oauth_unexpected_principal");
            return;
        }

        if (!(oauthToken.getPrincipal() instanceof OidcUser oidc)) {
            redirectError(request, response, "oauth_oidc_required");
            return;
        }

        OAuthLoginOutcome outcome = authService.loginOrSignupFromGoogle(oidc);
        if (!outcome.isSuccess()) {
            String code = outcome.errorCode() != null ? outcome.errorCode() : "oauth_unknown";
            redirectError(request, response, code);
            return;
        }

        AuthResponse auth = outcome.auth();
        String base = stripTrailingSlash(appProperties.frontend().baseUrl());
        String qs =
                "token="
                        + URLEncoder.encode(auth.accessToken(), StandardCharsets.UTF_8)
                        + "&refresh="
                        + URLEncoder.encode(auth.refreshToken(), StandardCharsets.UTF_8)
                        + "&expires_at="
                        + URLEncoder.encode(auth.accessTokenExpiresAt().toString(), StandardCharsets.UTF_8);
        invalidateSession(request);
        response.sendRedirect(base + "/oauth/callback?" + qs);
    }

    private void redirectError(HttpServletRequest request, HttpServletResponse response, String errorCode)
            throws IOException {
        String base = stripTrailingSlash(appProperties.frontend().baseUrl());
        String location =
                base
                        + "/oauth/callback?error="
                        + URLEncoder.encode(errorCode, StandardCharsets.UTF_8);
        invalidateSession(request);
        response.sendRedirect(location);
    }

    private static void invalidateSession(HttpServletRequest request) {
        var session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }

    private static String stripTrailingSlash(String s) {
        if (s == null || s.isEmpty()) return "";
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }
}
