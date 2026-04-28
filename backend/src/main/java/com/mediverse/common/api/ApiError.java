package com.mediverse.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

/**
 * Machine-readable error payload returned inside {@link ApiResponse#error()}. Field-level
 * validation failures are surfaced via {@link FieldViolation}.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        ErrorCode code,
        String message,
        List<FieldViolation> details,
        String path,
        Instant timestamp) {

    public static ApiError of(ErrorCode code, String message, String path) {
        return new ApiError(code, message, null, path, Instant.now());
    }

    public static ApiError of(ErrorCode code, String message, List<FieldViolation> details, String path) {
        return new ApiError(code, message, details, path, Instant.now());
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record FieldViolation(String field, String message, Object rejectedValue) {}
}
