package com.mediverse.common.exception;

import com.mediverse.common.api.ApiError;
import com.mediverse.common.api.ApiException;
import com.mediverse.common.api.ApiResponse;
import com.mediverse.common.api.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

/**
 * Translates every exception that escapes a controller into a uniform {@link ApiResponse} error
 * envelope. Authentication/authorization failures inside the security filter chain are handled
 * separately by {@code RestAuthenticationEntryPoint} and {@code RestAccessDeniedHandler}; the
 * handlers here only fire if the exceptions reach the dispatcher (rare but possible).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApi(ApiException ex, HttpServletRequest req) {
        return build(ex.code(), ex.getMessage(), ex.details(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<ApiError.FieldViolation> details = ex.getBindingResult().getFieldErrors().stream()
                .map(GlobalExceptionHandler::toViolation)
                .toList();
        return build(ErrorCode.VALIDATION_ERROR, "Validation failed", details, req);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraint(ConstraintViolationException ex, HttpServletRequest req) {
        List<ApiError.FieldViolation> details = ex.getConstraintViolations().stream()
                .map(GlobalExceptionHandler::toViolation)
                .toList();
        return build(ErrorCode.VALIDATION_ERROR, "Validation failed", details, req);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build(ErrorCode.BAD_REQUEST, "Malformed JSON request", null, req);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        return build(ErrorCode.BAD_REQUEST, "Missing parameter: " + ex.getParameterName(), null, req);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        return build(ErrorCode.BAD_REQUEST, "Invalid value for parameter: " + ex.getName(), null, req);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoHandler(NoHandlerFoundException ex, HttpServletRequest req) {
        return build(ErrorCode.NOT_FOUND, "Resource not found", null, req);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethod(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return build(ErrorCode.METHOD_NOT_ALLOWED, ex.getMessage(), null, req);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleUpload(MaxUploadSizeExceededException ex, HttpServletRequest req) {
        return build(ErrorCode.PAYLOAD_TOO_LARGE, "Upload too large", null, req);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Data integrity violation on {}: {}", req.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return build(ErrorCode.CONFLICT, "Conflicts with existing data", null, req);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex, HttpServletRequest req) {
        return build(ErrorCode.UNAUTHORIZED, "Invalid credentials", null, req);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuth(AuthenticationException ex, HttpServletRequest req) {
        return build(ErrorCode.UNAUTHORIZED, "Authentication required", null, req);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(ErrorCode.FORBIDDEN, "Access denied", null, req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAny(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception on {} {}", req.getMethod(), req.getRequestURI(), ex);
        return build(ErrorCode.INTERNAL_ERROR, "Something went wrong", null, req);
    }

    private static ResponseEntity<ApiResponse<Void>> build(
            ErrorCode code,
            String message,
            List<ApiError.FieldViolation> details,
            HttpServletRequest req) {
        HttpStatus status = code.status();
        ApiError err = ApiError.of(code, message, details, req.getRequestURI());
        return ResponseEntity.status(status).body(ApiResponse.error(err));
    }

    private static ApiError.FieldViolation toViolation(FieldError fe) {
        return new ApiError.FieldViolation(fe.getField(), fe.getDefaultMessage(), fe.getRejectedValue());
    }

    private static ApiError.FieldViolation toViolation(ConstraintViolation<?> cv) {
        String path = cv.getPropertyPath() == null ? null : cv.getPropertyPath().toString();
        return new ApiError.FieldViolation(path, cv.getMessage(), cv.getInvalidValue());
    }
}
