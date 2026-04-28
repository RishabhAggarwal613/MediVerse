package com.mediverse.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Uniform envelope returned by every controller and the {@code GlobalExceptionHandler}.
 *
 * <p>Exactly one of {@link #data} or {@link #error} is populated. Pagination/meta info will be
 * added in later phases via a dedicated {@code Meta} record.
 *
 * @param <T> payload type for successful responses
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        T data,
        ApiError error) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(true, null, null);
    }

    public static <T> ApiResponse<T> error(ApiError error) {
        return new ApiResponse<>(false, null, error);
    }
}
