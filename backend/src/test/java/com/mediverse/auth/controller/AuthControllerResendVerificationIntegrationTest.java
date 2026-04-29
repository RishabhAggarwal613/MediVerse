package com.mediverse.auth.controller;

import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.auth.service.AuthService;
import com.mediverse.user.domain.Provider;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * {@code @AuthenticationPrincipal} on {@link AuthController#resendVerification} requires the
 * Spring Security MVC argument resolver, which is registered in the full app context but not in
 * sliced {@code @WebMvcTest}. This light integration test covers that path.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = true)
@ActiveProfiles("test")
class AuthControllerResendVerificationIntegrationTest {

    @MockBean
    AuthService authService;

    @Autowired
    MockMvc mockMvc;

    @Test
    void resendVerification_withAuthenticatedUser_returnsOk() throws Exception {
        User entity =
                User.builder()
                        .id(9L)
                        .email("x@example.com")
                        .password("x")
                        .fullName("X")
                        .role(Role.PATIENT)
                        .provider(Provider.LOCAL)
                        .emailVerified(false)
                        .enabled(true)
                        .build();
        MediverseUserPrincipal principal = new MediverseUserPrincipal(entity);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        mockMvc.perform(post("/api/auth/resend-verification").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(authService).resendVerification(entity);
    }
}
