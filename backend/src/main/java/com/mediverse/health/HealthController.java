package com.mediverse.health;

import com.mediverse.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public liveness probe — used by the FE on boot and by uptime monitors. Intentionally trivial; it
 * does not touch the DB or other dependencies, so an outage in those does not flip the probe.
 */
@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Service liveness")
@SecurityRequirements
public class HealthController {

    private final String applicationName;
    private final String activeProfile;
    private final boolean googleOAuthAvailable;

    public HealthController(
            @Value("${spring.application.name:mediverse}") String applicationName,
            @Value("${spring.profiles.active:default}") String activeProfile,
            @Value("${google.oauth.client-id:}") String googleClientId,
            @Value("${google.oauth.client-secret:}") String googleClientSecret) {
        this.applicationName = applicationName;
        this.activeProfile = activeProfile;
        this.googleOAuthAvailable =
                StringUtils.hasText(googleClientId) && StringUtils.hasText(googleClientSecret);
    }

    @Operation(
            summary = "Liveness probe",
            description = "Returns service status, profile name, time, and whether Google OAuth is configured.")
    @GetMapping
    public ApiResponse<HealthDto> health() {
        return ApiResponse.ok(
                new HealthDto("UP", applicationName, activeProfile, Instant.now(), googleOAuthAvailable));
    }

    public record HealthDto(
            String status,
            String service,
            String profile,
            Instant timestamp,
            boolean googleOAuthAvailable) {}
}
