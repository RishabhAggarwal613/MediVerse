package com.mediverse.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.mediverse.auth.oauth.OAuthLoginOutcome;
import com.mediverse.auth.repository.EmailVerificationTokenRepository;
import com.mediverse.auth.repository.PasswordResetTokenRepository;
import com.mediverse.auth.repository.RefreshTokenRepository;
import com.mediverse.auth.security.JwtService;
import com.mediverse.common.config.properties.AppProperties;
import com.mediverse.email.EmailService;
import com.mediverse.storage.StorageService;
import com.mediverse.user.domain.Patient;
import com.mediverse.user.domain.Provider;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import com.mediverse.user.repository.DoctorRepository;
import com.mediverse.user.repository.PatientRepository;
import com.mediverse.user.repository.UserRepository;
import java.time.Duration;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceGoogleOAuthTest {

    @Mock UserRepository userRepository;
    @Mock PatientRepository patientRepository;
    @Mock DoctorRepository doctorRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Mock PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock JwtService jwtService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock StorageService storageService;
    @Mock EmailService emailService;
    @Mock AppProperties appProperties;

    @InjectMocks AuthService authService;

    private OidcUser oidc(String sub, String email, Boolean emailVerified, String fullName) {
        OidcUser u = org.mockito.Mockito.mock(OidcUser.class);
        when(u.getSubject()).thenReturn(sub);
        when(u.getEmail()).thenReturn(email);
        when(u.getEmailVerified()).thenReturn(emailVerified);
        when(u.getFullName()).thenReturn(fullName);
        return u;
    }

    @BeforeEach
    void wireJwtMint() {
        when(jwtService.accessTtl()).thenReturn(Duration.ofMinutes(15));
        when(jwtService.refreshTtl()).thenReturn(Duration.ofDays(7));
        when(jwtService.generateAccessToken(any())).thenAnswer(inv -> "jwt-" + inv.getArgument(0, User.class).getEmail());
        when(refreshTokenRepository.save(any())).then(inv -> inv.getArgument(0));
        when(storageService.urlFor(anyString())).thenReturn("http://example.com/a");
        when(appProperties.frontend()).thenReturn(new AppProperties.Frontend("http://localhost:3000"));
        when(emailVerificationTokenRepository.save(any())).then(inv -> inv.getArgument(0));
        when(passwordResetTokenRepository.save(any())).then(inv -> inv.getArgument(0));
        when(doctorRepository.save(any())).then(inv -> inv.getArgument(0));
    }

    @Test
    void returnsTokensWhenGoogleUserExistsBySubject() {
        User existing =
                User.builder()
                        .id(1L)
                        .email("x@example.com")
                        .fullName("Existing")
                        .role(Role.PATIENT)
                        .provider(Provider.GOOGLE)
                        .providerId("google-sub-1")
                        .emailVerified(true)
                        .enabled(true)
                        .build();
        when(userRepository.findByProviderAndProviderId(Provider.GOOGLE, "google-sub-1"))
                .thenReturn(Optional.of(existing));

        OAuthLoginOutcome outcome =
                authService.loginOrSignupFromGoogle(oidc("google-sub-1", "x@example.com", true, "Bob"));

        assertThat(outcome.isSuccess()).isTrue();
        assertThat(outcome.auth().accessToken()).startsWith("jwt-x@example.com");
        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void returnsErrorWhenSameEmailUsesLocalLogin() {
        when(userRepository.findByProviderAndProviderId(Provider.GOOGLE, "google-sub")).thenReturn(Optional.empty());
        User local =
                User.builder()
                        .id(2L)
                        .email("local@example.com")
                        .fullName("Local User")
                        .password("hash")
                        .role(Role.PATIENT)
                        .provider(Provider.LOCAL)
                        .emailVerified(true)
                        .enabled(true)
                        .build();
        when(userRepository.findByEmailIgnoreCase("local@example.com")).thenReturn(Optional.of(local));

        OAuthLoginOutcome outcome = authService.loginOrSignupFromGoogle(oidc("google-sub", "local@example.com", true, "Lu"));

        assertThat(outcome.isSuccess()).isFalse();
        assertThat(outcome.errorCode()).isEqualTo("oauth_email_in_use");
        verify(emailService, never()).sendWelcome(anyString(), anyString());
    }

    @Test
    void registersPatientWhenGoogleIsNewUser() {
        when(userRepository.findByProviderAndProviderId(Provider.GOOGLE, "google-sub")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.empty());
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        when(userRepository.save(userCaptor.capture()))
                .thenAnswer(
                        inv -> {
                            User u = inv.getArgument(0);
                            u.setId(99L);
                            return u;
                        });
        when(patientRepository.save(any(Patient.class))).then(inv -> inv.getArgument(0));

        OAuthLoginOutcome outcome =
                authService.loginOrSignupFromGoogle(oidc("google-sub", "new@example.com", true, "Newbie"));

        assertThat(outcome.isSuccess()).isTrue();
        assertThat(userCaptor.getValue().getProvider()).isEqualTo(Provider.GOOGLE);
        assertThat(userCaptor.getValue().getRole()).isEqualTo(Role.PATIENT);
        verify(emailService).sendWelcome("new@example.com", "Newbie");
    }

    @Test
    void returnsErrorWhenGoogleEmailMissing() {
        OidcUser u = org.mockito.Mockito.mock(OidcUser.class);
        when(u.getSubject()).thenReturn("sub");
        when(u.getEmail()).thenReturn(null);
        OAuthLoginOutcome outcome = authService.loginOrSignupFromGoogle(u);
        assertThat(outcome.errorCode()).isEqualTo("oauth_no_email");
    }
}
