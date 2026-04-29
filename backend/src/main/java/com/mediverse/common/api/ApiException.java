package com.mediverse.common.api;

import java.util.List;

/**
 * Domain-level exception that always maps to a deterministic HTTP status via {@link ErrorCode}.
 *
 * <p>Throw this from services/controllers; {@code GlobalExceptionHandler} will translate it to an
 * {@link ApiResponse#error(ApiError)}. For convenience, factory methods cover the common cases.
 */
public class ApiException extends RuntimeException {

    private final ErrorCode code;
    private final List<ApiError.FieldViolation> details;

    public ApiException(ErrorCode code, String message) {
        this(code, message, null);
    }

    public ApiException(ErrorCode code, String message, List<ApiError.FieldViolation> details) {
        super(message);
        this.code = code;
        this.details = details;
    }

    public ErrorCode code() {
        return code;
    }

    public List<ApiError.FieldViolation> details() {
        return details;
    }

    public static ApiException notFound(String message) {
        return new ApiException(ErrorCode.NOT_FOUND, message);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(ErrorCode.BAD_REQUEST, message);
    }

    public static ApiException conflict(String message) {
        return new ApiException(ErrorCode.CONFLICT, message);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(ErrorCode.FORBIDDEN, message);
    }

    public static ApiException unauthorized(String message) {
        return new ApiException(ErrorCode.UNAUTHORIZED, message);
    }

    public static ApiException upstreamUnavailable(String message) {
        return new ApiException(ErrorCode.UPSTREAM_UNAVAILABLE, message);
    }
}
