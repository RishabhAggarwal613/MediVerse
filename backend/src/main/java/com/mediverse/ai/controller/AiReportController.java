package com.mediverse.ai.controller;

import com.mediverse.ai.dto.AiReportDetailDto;
import com.mediverse.ai.dto.AiReportSummaryDto;
import com.mediverse.ai.dto.ShareAiReportRequest;
import com.mediverse.ai.service.AiReportService;
import com.mediverse.auth.security.JwtAuthenticationFilter;
import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.common.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai/reports")
@RequiredArgsConstructor
public class AiReportController {

    private final AiReportService aiReportService;

    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<AiReportDetailDto> scan(
            @AuthenticationPrincipal MediverseUserPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        return ApiResponse.ok(aiReportService.scan(principal.user(), file));
    }

    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<List<AiReportSummaryDto>> list(@AuthenticationPrincipal MediverseUserPrincipal principal) {
        return ApiResponse.ok(aiReportService.listMine(principal.user()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR')")
    public ApiResponse<AiReportDetailDto> get(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @PathVariable("id") long id) {
        return ApiResponse.ok(aiReportService.getById(principal.user(), id));
    }

    @PostMapping("/{id}/share")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<AiReportDetailDto> share(
            @AuthenticationPrincipal MediverseUserPrincipal principal,
            @PathVariable("id") long id,
            @Valid @RequestBody ShareAiReportRequest body) {
        return ApiResponse.ok(aiReportService.share(principal.user(), id, body));
    }

    @PostMapping("/{id}/unshare")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<AiReportDetailDto> unshare(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @PathVariable("id") long id) {
        return ApiResponse.ok(aiReportService.unshare(principal.user(), id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @PathVariable("id") long id) {
        aiReportService.delete(principal.user(), id);
        return ApiResponse.ok();
    }
}
