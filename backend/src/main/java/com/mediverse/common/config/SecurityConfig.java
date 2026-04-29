package com.mediverse.common.config;

import com.mediverse.auth.security.JwtAuthenticationFilter;
import com.mediverse.common.security.RestAccessDeniedHandler;
import com.mediverse.common.security.RestAuthenticationEntryPoint;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Stateless security configuration for the main app (JWT Bearer).
 *
 * <p>When Google OAuth credentials are configured, a separate
 * {@link com.mediverse.auth.oauth.GoogleOAuthSecurityConfig} chain is registered
 * at {@link com.mediverse.common.config.SecurityFilterChainOrder#OAUTH2} with
 * {@code sessionCreationPolicy(IF_REQUIRED)} for {@code /oauth2/**} and
 * {@code /login/oauth2/**} only; this chain stays at
 * {@link com.mediverse.common.config.SecurityFilterChainOrder#API_JWT}.
 *
 * <ul>
 *   <li>No sessions, no CSRF (we don't use cookies for auth).
 *   <li>{@link JwtAuthenticationFilter} runs before
 *       {@link UsernamePasswordAuthenticationFilter} and pins an
 *       authenticated principal whenever a valid Bearer token is presented.
 *   <li>JSON 401/403 envelopes via {@link RestAuthenticationEntryPoint} and
 *       {@link RestAccessDeniedHandler}.
 *   <li>Public allowlist: health, auth, OAuth2, OpenAPI, Swagger UI, error.
 *   <li>{@code PasswordEncoder} (BCrypt) and {@code AuthenticationManager}
 *       beans for the auth controller.
 * </ul>
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * Paths that must stay {@code permitAll} because they are reached before a JWT exists
     * (register, login, OAuth callback) or use body tokens (refresh, logout).
     * <p>
     * {@code /api/auth/resend-verification} is <em>not</em> listed here — it requires
     * an authenticated user (Bearer access token).
     */
    private static final String[] PUBLIC_PATHS = {
            "/api/health",
            "/api/health/**",
            "/api/auth/register/patient",
            "/api/auth/register/doctor",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/logout",
            "/api/auth/verify-email",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/oauth2/**",
            "/login/oauth2/**",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/swagger-ui",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/error",
            // Local-fs adapter serves uploaded files here in dev. In prod we
            // use S3 with presigned URLs and these paths don't exist.
            "/uploads/**"
    };

    @Bean
    @Order(SecurityFilterChainOrder.API_JWT)
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .anonymous(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_PATHS).permitAll()
                        // Doctor discovery (GET) is public; doctor self-service lives under /me/**
                        .requestMatchers("/api/doctors/me", "/api/doctors/me/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/doctors").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/specializations").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/*/availability", "/api/doctors/*/slots")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/doctors/*").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}
