package com.mediverse.user.controller;

import com.mediverse.auth.dto.UserDto;
import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.common.api.ApiResponse;
import com.mediverse.user.dto.OnboardingDto;
import com.mediverse.user.dto.UpdateMeRequest;
import com.mediverse.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserDto> me(@AuthenticationPrincipal MediverseUserPrincipal principal) {
        return ApiResponse.ok(userService.me(principal.user()));
    }

    @PutMapping(path = "/me", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserDto> updateMe(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @Valid @RequestBody UpdateMeRequest req) {
        return ApiResponse.ok(userService.updateMe(principal.user(), req));
    }

    @PostMapping(path = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserDto> uploadAvatar(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @RequestPart("file") MultipartFile file) {
        return ApiResponse.ok(userService.updateAvatar(principal.user(), file));
    }

    @GetMapping("/me/onboarding")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<OnboardingDto> onboarding(@AuthenticationPrincipal MediverseUserPrincipal principal) {
        return ApiResponse.ok(userService.onboarding(principal.user()));
    }
}
