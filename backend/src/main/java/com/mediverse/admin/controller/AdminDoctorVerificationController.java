package com.mediverse.admin.controller;

import com.mediverse.admin.dto.AdminPendingDoctorDto;
import com.mediverse.admin.dto.AdminRejectDoctorRequest;
import com.mediverse.admin.service.AdminVerificationService;
import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.common.api.ApiException;
import com.mediverse.common.api.ApiResponse;
import com.mediverse.doctor.dto.PageResponse;
import com.mediverse.user.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/doctors")
@RequiredArgsConstructor
public class AdminDoctorVerificationController {

    private final AdminVerificationService adminVerificationService;

    private static User currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw ApiException.unauthorized("Authentication required");
        }
        Object p = authentication.getPrincipal();
        if (p instanceof MediverseUserPrincipal mup) {
            return mup.user();
        }
        throw ApiException.unauthorized("Invalid session");
    }

    /** Allowlisted emails only ({@code mediverse.admin.emails} / {@code ADMIN_EMAILS}). */
    @GetMapping("/pending")
    public ApiResponse<PageResponse<AdminPendingDoctorDto>> listPending(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(
                adminVerificationService.listPending(currentUser(authentication), page, size));
    }

    @PostMapping("/{doctorId}/approve")
    public ApiResponse<Void> approve(Authentication authentication, @PathVariable long doctorId) {
        adminVerificationService.approve(currentUser(authentication), doctorId);
        return ApiResponse.ok();
    }

    @PostMapping("/{doctorId}/reject")
    public ApiResponse<Void> reject(
            Authentication authentication,
            @PathVariable long doctorId,
            @Valid @RequestBody AdminRejectDoctorRequest req) {
        adminVerificationService.reject(currentUser(authentication), doctorId, req.reason());
        return ApiResponse.ok();
    }
}
