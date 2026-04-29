package com.mediverse.auth.oauth;

import com.mediverse.common.config.SecurityFilterChainOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Session-backed filter chain for Google OAuth2 only. Registered when
 * {@link GoogleOAuthCredentialsPresent} matches (non-blank client id + secret).
 */
@Configuration
@Conditional(GoogleOAuthCredentialsPresent.class)
@RequiredArgsConstructor
public class GoogleOAuthSecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final GoogleOAuthLoginSuccessHandler successHandler;
    private final GoogleOAuthLoginFailureHandler failureHandler;

    @Bean
    @Order(SecurityFilterChainOrder.OAUTH2)
    SecurityFilterChain googleOAuthSecurityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher("/oauth2/**", "/login/oauth2/**")
                .csrf(AbstractHttpConfigurer::disable)
                .cors(c -> c.configurationSource(corsConfigurationSource))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(a -> a.anyRequest().permitAll())
                .anonymous(Customizer.withDefaults())
                .oauth2Login(o -> o.successHandler(successHandler).failureHandler(failureHandler));
        return http.build();
    }
}
