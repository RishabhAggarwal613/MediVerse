package com.mediverse.auth.service;

import com.mediverse.auth.domain.RefreshToken;
import com.mediverse.auth.dto.AuthResponse;
import com.mediverse.auth.dto.LoginRequest;
import com.mediverse.auth.dto.LogoutRequest;
import com.mediverse.auth.dto.RefreshRequest;
import com.mediverse.auth.dto.RegisterDoctorRequest;
import com.mediverse.auth.dto.RegisterPatientRequest;
import com.mediverse.auth.dto.UserDto;
import com.mediverse.auth.repository.EmailVerificationTokenRepository;
import com.mediverse.auth.repository.RefreshTokenRepository;
import com.mediverse.auth.security.JwtService;
import com.mediverse.auth.security.TokenHasher;
import com.mediverse.common.api.ApiException;
import com.mediverse.common.config.properties.AppProperties;
import com.mediverse.email.EmailService;
import com.mediverse.storage.StorageService;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.Patient;
import com.mediverse.user.domain.Provider;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import com.mediverse.user.repository.DoctorRepository;
import com.mediverse.user.repository.PatientRepository;
import com.mediverse.user.repository.UserRepository;
import com.mediverse.auth.domain.EmailVerificationToken;
import com.mediverse.auth.domain.PasswordResetToken;
import com.mediverse.auth.repository.PasswordResetTokenRepository;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import com.mediverse.auth.oauth.OAuthLoginOutcome;

/**
 * Owns all auth-side business logic: registration, login, refresh-token
 * rotation, logout. Runs each public method in its own transaction.
 *
 * <p>Refresh tokens are stored as SHA-256 hashes; the plaintext is shown to
 * the client exactly once (in {@link AuthResponse}).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final Set<String> ALLOWED_LICENSE_TYPES =
            Set.of("application/pdf", "image/jpeg", "image/jpg", "image/png");
    private static final Duration EMAIL_VERIFY_TTL = Duration.ofHours(24);
    private static final Duration PASSWORD_RESET_TTL = Duration.ofHours(1);

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;
    private final EmailService emailService;
    private final AppProperties appProperties;

    @Transactional
    public AuthResponse registerPatient(RegisterPatientRequest req) {
        ensureEmailNotUsed(req.email());

        User user = User.builder()
                .email(req.email().toLowerCase())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .phone(req.phone())
                .role(Role.PATIENT)
                .provider(Provider.LOCAL)
                .emailVerified(false)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        Patient patient = Patient.builder().user(user).build();
        patientRepository.save(patient);

        sendVerificationEmail(user);
        emailService.sendWelcome(user.getEmail(), user.getFullName());
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse registerDoctor(RegisterDoctorRequest req, MultipartFile licenseFile) {
        ensureEmailNotUsed(req.email());
        ensureLicenseNumberNotUsed(req.licenseNumber());
        validateLicenseFile(licenseFile);

        User user = User.builder()
                .email(req.email().toLowerCase())
                .password(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .phone(req.phone())
                .role(Role.DOCTOR)
                .provider(Provider.LOCAL)
                .emailVerified(false)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        // Upload AFTER user save so the storage key carries the user id, but
        // BEFORE doctor save so a failure rolls back the user too (transaction).
        String licenseKey = uploadLicense(user.getId(), licenseFile);

        Doctor doctor = Doctor.builder()
                .user(user)
                .specialization(req.specialization())
                .qualifications(req.qualifications())
                .licenseNumber(req.licenseNumber())
                .yearsExperience(req.yearsExperience())
                .consultationFee(req.consultationFee())
                .bio(req.bio())
                .licenseDocUrl(licenseKey)
                .build();
        doctorRepository.save(doctor);

        sendVerificationEmail(user);
        emailService.sendWelcome(user.getEmail(), user.getFullName());
        notifyAdminsOfPendingDoctor(user, doctor);
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailIgnoreCase(req.email())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (user.getProvider() != Provider.LOCAL || user.getPassword() == null) {
            throw ApiException.unauthorized(
                    "This account uses Google sign-in. Please continue with Google.");
        }
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        if (!user.isEnabled()) {
            throw ApiException.unauthorized("Account is disabled. Contact support.");
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest req) {
        String hash = TokenHasher.hash(req.refreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> ApiException.unauthorized("Invalid refresh token"));

        if (!stored.isUsable()) {
            // Defensive: revoke the user's other tokens too in case of replay.
            refreshTokenRepository.revokeAllByUser(stored.getUser());
            throw ApiException.unauthorized("Refresh token expired or revoked");
        }

        // Rotate: revoke the just-used token and mint a fresh pair.
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        return issueTokens(stored.getUser());
    }

    /**
     * Links Google {@code sub} + email to an existing user or registers a new PATIENT.
     * Never throws for expected conflicts — returns {@link OAuthLoginOutcome#error}.
     */
    @Transactional
    public OAuthLoginOutcome loginOrSignupFromGoogle(OidcUser oidc) {
        String sub = oidc.getSubject();
        if (sub == null || sub.isBlank()) {
            return OAuthLoginOutcome.error("oauth_invalid_subject");
        }
        String email = oidc.getEmail();
        if (email == null || email.isBlank()) {
            return OAuthLoginOutcome.error("oauth_no_email");
        }
        Boolean ev = oidc.getEmailVerified();
        if (ev == null || !ev) {
            return OAuthLoginOutcome.error("oauth_email_not_verified");
        }
        String emailNorm = email.toLowerCase();

        User existingBySub =
                userRepository.findByProviderAndProviderId(Provider.GOOGLE, sub).orElse(null);
        if (existingBySub != null) {
            if (!existingBySub.isEnabled()) {
                return OAuthLoginOutcome.error("oauth_account_disabled");
            }
            return OAuthLoginOutcome.success(issueTokens(existingBySub));
        }

        User byEmail = userRepository.findByEmailIgnoreCase(emailNorm).orElse(null);
        if (byEmail != null) {
            if (byEmail.getProvider() == Provider.LOCAL) {
                return OAuthLoginOutcome.error("oauth_email_in_use");
            }
            if (byEmail.getProvider() == Provider.GOOGLE) {
                if (!sub.equals(byEmail.getProviderId())) {
                    return OAuthLoginOutcome.error("oauth_google_account_conflict");
                }
                if (!byEmail.isEnabled()) {
                    return OAuthLoginOutcome.error("oauth_account_disabled");
                }
                return OAuthLoginOutcome.success(issueTokens(byEmail));
            }
        }

        String fullName = oidc.getFullName();
        if (fullName == null || fullName.isBlank()) {
            int at = emailNorm.indexOf('@');
            fullName = at > 0 ? emailNorm.substring(0, at) : emailNorm;
        }

        User user = User.builder()
                .email(emailNorm)
                .password(null)
                .fullName(fullName)
                .phone(null)
                .role(Role.PATIENT)
                .provider(Provider.GOOGLE)
                .providerId(sub)
                .emailVerified(true)
                .emailVerifiedAt(Instant.now())
                .enabled(true)
                .build();
        user = userRepository.save(user);
        Patient patient = Patient.builder().user(user).build();
        patientRepository.save(patient);
        emailService.sendWelcome(user.getEmail(), user.getFullName());

        return OAuthLoginOutcome.success(issueTokens(user));
    }

    @Transactional
    public void logout(LogoutRequest req) {
        String hash = TokenHasher.hash(req.refreshToken());
        refreshTokenRepository.findByTokenHash(hash).ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    @Transactional
    public void verifyEmail(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw ApiException.badRequest("Token is required");
        }
        EmailVerificationToken row = emailVerificationTokenRepository
                .findByTokenHash(TokenHasher.hash(rawToken))
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired verification link"));
        if (!row.isUsable()) {
            throw ApiException.badRequest("This verification link has already been used or has expired");
        }
        User user = row.getUser();
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(Instant.now());
        userRepository.save(user);
        row.setUsedAt(Instant.now());
        emailVerificationTokenRepository.save(row);
    }

    @Transactional
    public void resendVerification(User user) {
        if (user.isEmailVerified()) {
            throw ApiException.badRequest("Email is already verified");
        }
        if (user.getProvider() != Provider.LOCAL) {
            throw ApiException.badRequest("Google accounts are verified by Google");
        }
        sendVerificationEmail(user);
    }

    /**
     * Always succeeds from the caller's perspective (returns 200) so we never leak whether an
     * email is registered. Only sends mail for local accounts with a password.
     */
    @Transactional
    public void forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            return;
        }
        userRepository
                .findByEmailIgnoreCase(email.trim())
                .filter(u -> u.getProvider() == Provider.LOCAL && u.getPassword() != null)
                .ifPresent(this::sendPasswordResetEmail);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        if (rawToken == null || rawToken.isBlank()) {
            throw ApiException.badRequest("Token is required");
        }
        PasswordResetToken row = passwordResetTokenRepository
                .findByTokenHash(TokenHasher.hash(rawToken))
                .orElseThrow(() -> ApiException.badRequest("Invalid or expired password reset link"));
        if (!row.isUsable()) {
            throw ApiException.badRequest("This reset link has already been used or has expired");
        }
        User user = row.getUser();
        if (user.getProvider() != Provider.LOCAL || user.getPassword() == null) {
            throw ApiException.badRequest("This account does not support password reset");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        row.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(row);
        refreshTokenRepository.revokeAllByUser(user);
    }

    private AuthResponse issueTokens(User user) {
        Instant now = Instant.now();
        String access = jwtService.generateAccessToken(user);
        Instant accessExp = now.plus(jwtService.accessTtl());

        String refresh = TokenHasher.generate();
        Instant refreshExp = now.plus(jwtService.refreshTtl());
        RefreshToken row = RefreshToken.builder()
                .user(user)
                .tokenHash(TokenHasher.hash(refresh))
                .expiresAt(refreshExp)
                .revoked(false)
                .build();
        refreshTokenRepository.save(row);

        return AuthResponse.of(access, refresh, accessExp, refreshExp, UserDto.from(user, storageService));
    }

    private void ensureEmailNotUsed(String email) {
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with this email already exists");
        }
    }

    private void ensureLicenseNumberNotUsed(String licenseNumber) {
        if (doctorRepository.existsByLicenseNumberIgnoreCase(licenseNumber)) {
            throw ApiException.conflict("A doctor with this license number is already registered");
        }
    }

    private void validateLicenseFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("License document is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_LICENSE_TYPES.contains(contentType.toLowerCase())) {
            throw ApiException.badRequest("License must be a PDF or an image (PNG/JPEG)");
        }
    }

    private String uploadLicense(Long userId, MultipartFile file) {
        String key = StorageService.buildKey(StorageService.LICENSE_PREFIX, userId, file.getContentType());
        try {
            return storageService.upload(key, file.getBytes(), file.getContentType());
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read uploaded license bytes", e);
        }
    }

    private void sendVerificationEmail(User user) {
        emailVerificationTokenRepository.deleteAllByUser(user);
        String token = TokenHasher.generate();
        EmailVerificationToken row = EmailVerificationToken.builder()
                .user(user)
                .tokenHash(TokenHasher.hash(token))
                .expiresAt(Instant.now().plus(EMAIL_VERIFY_TTL))
                .build();
        emailVerificationTokenRepository.save(row);

        String link = "%s/verify-email?token=%s".formatted(
                stripTrailingSlash(appProperties.frontend().baseUrl()),
                URLEncoder.encode(token, StandardCharsets.UTF_8));
        emailService.sendEmailVerification(user.getEmail(), user.getFullName(), link);
    }

    private void sendPasswordResetEmail(User user) {
        passwordResetTokenRepository.deleteAllByUser(user);
        String token = TokenHasher.generate();
        PasswordResetToken row = PasswordResetToken.builder()
                .user(user)
                .tokenHash(TokenHasher.hash(token))
                .expiresAt(Instant.now().plus(PASSWORD_RESET_TTL))
                .build();
        passwordResetTokenRepository.save(row);
        String link = "%s/reset-password?token=%s"
                .formatted(
                        stripTrailingSlash(appProperties.frontend().baseUrl()),
                        URLEncoder.encode(token, StandardCharsets.UTF_8));
        emailService.sendPasswordReset(user.getEmail(), user.getFullName(), link);
    }

    private void notifyAdminsOfPendingDoctor(User doctorUser, Doctor doctor) {
        List<String> admins = appProperties.admin() == null ? List.of() : appProperties.admin().emails();
        if (admins == null || admins.isEmpty()) {
            log.warn("No mediverse.admin.emails configured; doctor {} stuck pending until manually approved.",
                    doctorUser.getEmail());
            return;
        }
        String licenseUrl = storageService.urlFor(doctor.getLicenseDocUrl());
        String reviewLink = stripTrailingSlash(appProperties.frontend().baseUrl()) + "/admin/verifications";
        for (String adminEmail : admins) {
            emailService.sendDoctorVerificationPending(
                    adminEmail,
                    doctorUser.getFullName(),
                    doctorUser.getEmail(),
                    licenseUrl,
                    reviewLink);
        }
    }

    private static String stripTrailingSlash(String s) {
        if (s == null || s.isEmpty()) return "";
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }
}
