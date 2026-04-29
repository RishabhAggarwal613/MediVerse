package com.mediverse.auth.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.mediverse.common.config.properties.JwtProperties;
import com.mediverse.user.domain.Provider;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import org.junit.jupiter.api.Test;

/** Pure JVM test — does not spin up Spring Boot. */
class JwtServiceTest {

    @Test
    void generatesAndParsesSignedAccessToken_withSubjectRoleClaims() {
        JwtProperties props =
                new JwtProperties(
                        "test-only-secret-please-replace-with-a-strong-32+char-key",
                        15,
                        7,
                        "mediverse-unit-test");
        JwtService jwtService = new JwtService(props);

        User user =
                User.builder()
                        .id(42L)
                        .email("patient@example.com")
                        .fullName("Pat Example")
                        .role(Role.PATIENT)
                        .provider(Provider.LOCAL)
                        .build();

        String token = jwtService.generateAccessToken(user);
        var jws = jwtService.parseAccessToken(token);

        assertThat(jwtService.extractUserId(jws)).isEqualTo(42L);
        assertThat(jws.getPayload().get("email", String.class)).isEqualTo("patient@example.com");
        assertThat(jws.getPayload().get("role", String.class)).isEqualTo("PATIENT");
    }
}
