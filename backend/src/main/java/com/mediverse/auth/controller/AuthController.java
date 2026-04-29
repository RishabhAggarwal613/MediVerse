package com.mediverse.auth.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediverse.auth.dto.AuthResponse;
import com.mediverse.auth.dto.ForgotPasswordRequest;
import com.mediverse.auth.dto.LoginRequest;
import com.mediverse.auth.dto.LogoutRequest;
import com.mediverse.auth.dto.RefreshRequest;
import com.mediverse.auth.dto.RegisterDoctorRequest;
import com.mediverse.auth.dto.RegisterPatientRequest;
import com.mediverse.auth.dto.ResetPasswordRequest;
import com.mediverse.auth.dto.VerifyEmailRequest;
import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.auth.service.AuthService;
import com.mediverse.common.api.ApiException;
import com.mediverse.common.api.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import jakarta.validation.ConstraintViolation;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @PostMapping(path = "/register/patient", consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> registerPatient(@Valid @RequestBody RegisterPatientRequest req) {
        return ApiResponse.ok(authService.registerPatient(req));
    }

    /**
     * Doctor signup is multipart: a JSON {@code data} part holds the
     * {@link RegisterDoctorRequest} and a {@code license} part holds the file.
     * Splitting like this keeps validation and the file together in one call.
     */
    @PostMapping(path = "/register/doctor", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> registerDoctor(
            @RequestPart("data") String dataJson,
            @RequestPart("license") MultipartFile license) {
        RegisterDoctorRequest req = parseAndValidate(dataJson, RegisterDoctorRequest.class);
        return ApiResponse.ok(authService.registerDoctor(req, license));
    }

    @PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok(authService.login(req));
    }

    @PostMapping(path = "/refresh", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<AuthResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ApiResponse.ok(authService.refresh(req));
    }

    @PostMapping(path = "/logout", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<Void> logout(@Valid @RequestBody LogoutRequest req) {
        authService.logout(req);
        return ApiResponse.ok();
    }

    @PostMapping(path = "/verify-email", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest req) {
        authService.verifyEmail(req.token());
        return ApiResponse.ok();
    }

    @PostMapping("/resend-verification")
    public ApiResponse<Void> resendVerification(
            @AuthenticationPrincipal MediverseUserPrincipal principal) {
        authService.resendVerification(principal.user());
        return ApiResponse.ok();
    }

    @PostMapping(path = "/forgot-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req.email());
        return ApiResponse.ok();
    }

    @PostMapping(path = "/reset-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req.token(), req.newPassword());
        return ApiResponse.ok();
    }

    private <T> T parseAndValidate(String json, Class<T> type) {
        T parsed;
        try {
            parsed = objectMapper.readValue(json, type);
        } catch (JsonProcessingException e) {
            throw ApiException.badRequest("Malformed JSON in 'data' part: " + e.getOriginalMessage());
        }
        Set<ConstraintViolation<T>> violations = validator.validate(parsed);
        if (!violations.isEmpty()) {
            String detail = violations.stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .collect(Collectors.joining("; "));
            throw ApiException.badRequest("Validation failed: " + detail);
        }
        return parsed;
    }
}
