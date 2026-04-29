package com.mediverse.appointment.controller;

import com.mediverse.appointment.dto.AppointmentDto;
import com.mediverse.appointment.dto.BookAppointmentRequest;
import com.mediverse.appointment.dto.CompleteAppointmentRequest;
import com.mediverse.appointment.service.AppointmentService;
import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.common.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<AppointmentDto> book(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @Valid @RequestBody BookAppointmentRequest body) {
        return ApiResponse.ok(appointmentService.book(principal.user(), body));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<List<AppointmentDto>> listMine(
            @AuthenticationPrincipal MediverseUserPrincipal principal,
            @RequestParam(required = false) String status) {
        return ApiResponse.ok(appointmentService.listMine(principal.user(), status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<AppointmentDto> get(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(appointmentService.getByIdForUser(id, principal.user()));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<AppointmentDto> approve(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(appointmentService.approve(id, principal.user()));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<AppointmentDto> reject(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(appointmentService.reject(id, principal.user()));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<AppointmentDto> complete(
            @AuthenticationPrincipal MediverseUserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CompleteAppointmentRequest body) {
        return ApiResponse.ok(appointmentService.complete(id, principal.user(), body));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<AppointmentDto> cancel(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @PathVariable Long id) {
        return ApiResponse.ok(appointmentService.cancel(id, principal.user()));
    }
}
