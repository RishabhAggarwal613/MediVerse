package com.mediverse.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediverse.common.api.ApiError;
import com.mediverse.common.api.ApiResponse;
import com.mediverse.common.api.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

/**
 * Replaces Spring Security's default 403 (HTML) with our JSON {@link ApiResponse} envelope. Fires
 * for authenticated requests that lack the required role/authority.
 */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public RestAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex)
            throws IOException {
        ApiError err = ApiError.of(ErrorCode.FORBIDDEN, "Access denied", request.getRequestURI());
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), ApiResponse.error(err));
    }
}
