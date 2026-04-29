package com.mediverse.doctor.controller;

import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.common.api.ApiResponse;
import com.mediverse.doctor.dto.DoctorAvailabilityRuleDto;
import com.mediverse.doctor.dto.DoctorDashboardStatsDto;
import com.mediverse.doctor.dto.DoctorPublicDto;
import com.mediverse.doctor.dto.DoctorSummaryDto;
import com.mediverse.doctor.dto.PageResponse;
import com.mediverse.doctor.dto.SpecializationOptionDto;
import com.mediverse.doctor.dto.TimeSlotItemDto;
import com.mediverse.doctor.dto.UpdateDoctorProfileRequest;
import com.mediverse.doctor.dto.UpsertAvailabilityRequest;
import com.mediverse.doctor.service.DoctorService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping("/specializations")
    public ApiResponse<List<SpecializationOptionDto>> specializations() {
        return ApiResponse.ok(doctorService.listSpecializationOptions());
    }

    @GetMapping
    public ApiResponse<PageResponse<DoctorSummaryDto>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String specialization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(doctorService.searchDoctors(q, specialization, page, size));
    }

    @GetMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<DoctorPublicDto> myProfile(@AuthenticationPrincipal MediverseUserPrincipal principal) {
        return ApiResponse.ok(doctorService.getMyDoctorProfile(principal.user()));
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<DoctorPublicDto> updateMyProfile(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @Valid @RequestBody UpdateDoctorProfileRequest req) {
        return ApiResponse.ok(doctorService.updateMyDoctorProfile(principal.user(), req));
    }

    @GetMapping("/me/dashboard/stats")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<DoctorDashboardStatsDto> dashboardStats(@AuthenticationPrincipal MediverseUserPrincipal principal) {
        return ApiResponse.ok(doctorService.dashboardStats(principal.user()));
    }

    @GetMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<List<DoctorAvailabilityRuleDto>> myAvailability(
            @AuthenticationPrincipal MediverseUserPrincipal principal) {
        return ApiResponse.ok(doctorService.listAvailabilityForOwner(principal.user()));
    }

    @PostMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<DoctorAvailabilityRuleDto> addAvailability(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @Valid @RequestBody UpsertAvailabilityRequest req) {
        return ApiResponse.ok(doctorService.addAvailabilityRule(principal.user(), req));
    }

    @PutMapping("/me/availability/{ruleId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<DoctorAvailabilityRuleDto> updateAvailability(
            @AuthenticationPrincipal MediverseUserPrincipal principal,
            @PathVariable long ruleId,
            @Valid @RequestBody UpsertAvailabilityRequest req) {
        return ApiResponse.ok(doctorService.updateAvailabilityRule(principal.user(), ruleId, req));
    }

    @DeleteMapping("/me/availability/{ruleId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ApiResponse<Void> deleteAvailability(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @PathVariable long ruleId) {
        doctorService.deleteAvailabilityRule(principal.user(), ruleId);
        return ApiResponse.ok();
    }

    @GetMapping("/{id}")
    public ApiResponse<DoctorPublicDto> getById(@PathVariable Long id) {
        return ApiResponse.ok(doctorService.getDoctorPublic(id));
    }

    @GetMapping("/{id}/availability")
    public ApiResponse<List<DoctorAvailabilityRuleDto>> availabilityByDoctor(@PathVariable Long id) {
        return ApiResponse.ok(doctorService.listAvailabilityPublic(id));
    }

    @GetMapping("/{id}/slots")
    public ApiResponse<List<TimeSlotItemDto>> slotsForDate(
            @PathVariable Long id, @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.ok(doctorService.listFreeSlots(id, date));
    }
}
