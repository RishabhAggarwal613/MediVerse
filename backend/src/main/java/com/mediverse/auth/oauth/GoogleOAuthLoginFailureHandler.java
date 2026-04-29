package com.mediverse.auth.oauth;

import com.mediverse.common.config.properties.AppProperties;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Conditional;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

/**
 * Redirects failed Google OAuth to the SPA with a stable {@code error} code.
 */
@Component
@Conditional(GoogleOAuthCredentialsPresent.class)
@RequiredArgsConstructor
public class GoogleOAuthLoginFailureHandler implements AuthenticationFailureHandler {

    private final AppProperties appProperties;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception)
            throws IOException, ServletException {

        String code = "oauth_failed";
        if (exception instanceof OAuth2AuthenticationException oauth2) {
            if (oauth2.getError() != null && oauth2.getError().getErrorCode() != null) {
                code = "oauth_" + oauth2.getError().getErrorCode();
            }
        } else if (exception instanceof InternalAuthenticationServiceException) {
            code = "oauth_internal";
        }

        String base = stripTrailingSlash(appProperties.frontend().baseUrl());
        String location =
                "%s/oauth/callback?error=%s".formatted(base, URLEncoder.encode(code, StandardCharsets.UTF_8));
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
