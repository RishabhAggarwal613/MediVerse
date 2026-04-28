package com.mediverse.common.config;

import com.mediverse.common.config.properties.AppProperties;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Builds the {@link CorsConfigurationSource} consumed by Spring Security and Spring MVC.
 *
 * <p>Allowed origins come from {@code mediverse.cors.allowed-origins} (comma-separated env value).
 * Credentials are enabled so the FE can send the {@code Authorization} header and any future
 * refresh-token cookie; therefore wildcard origins are intentionally not supported.
 */
@Configuration
public class CorsConfig {

    private static final List<String> ALLOWED_METHODS =
            List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");

    private static final List<String> ALLOWED_HEADERS =
            List.of("Authorization", "Content-Type", "Accept", "Origin",
                    "X-Requested-With", "X-Request-Id");

    private static final List<String> EXPOSED_HEADERS =
            List.of("Authorization", "Location", "Content-Disposition", "X-Request-Id");

    private static final long MAX_AGE_SECONDS = 3600L;

    @Bean
    public CorsConfigurationSource corsConfigurationSource(AppProperties props) {
        CorsConfiguration cfg = new CorsConfiguration();
        List<String> origins = props.cors() == null ? List.of() : props.cors().allowedOrigins();
        cfg.setAllowedOriginPatterns(origins == null ? List.of() : origins);
        cfg.setAllowedMethods(ALLOWED_METHODS);
        cfg.setAllowedHeaders(ALLOWED_HEADERS);
        cfg.setExposedHeaders(EXPOSED_HEADERS);
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(MAX_AGE_SECONDS);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
