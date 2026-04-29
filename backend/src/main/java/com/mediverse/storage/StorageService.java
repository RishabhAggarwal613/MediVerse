package com.mediverse.storage;

import java.util.Locale;
import java.util.UUID;

/**
 * Abstraction over the underlying file store. Two implementations:
 * {@code LocalFsStorageService} (dev) and {@code S3StorageService} (prod).
 *
 * <p>Database columns store the {@link #upload upload} return value (the
 * canonical key, never a URL). Callers translate to a fresh URL on read via
 * {@link #urlFor}.
 */
public interface StorageService {

    /** Path prefix inside the bucket/filesystem for user profile pictures. */
    String PROFILE_PICS_PREFIX = "profile-pics";

    /** Path prefix for doctor license uploads. */
    String LICENSE_PREFIX = "licenses";

    /** Lab report uploads (S3/local key prefix). */
    String REPORTS_PREFIX = "reports";

    /**
     * Writes {@code bytes} to the store under {@code key}, replacing any
     * prior content at that key.
     *
     * @return the key (echoed back, for fluent persistence)
     */
    String upload(String key, byte[] bytes, String contentType);

    void delete(String key);

    boolean exists(String key);

    /**
     * Returns a URL the browser can use to GET the bytes. For local-fs,
     * this is a simple HTTP path. For S3, this is a short-lived presigned URL.
     */
    String urlFor(String key);

    /**
     * Builds a stable storage key for a user-owned file. Path layout:
     * {@code {prefix}/{ownerId}/{uuid}{ext}}. {@code prefix} is e.g.
     * {@code "profile-pics"} or {@code "licenses"}.
     */
    static String buildKey(String prefix, Long ownerId, String contentType) {
        String ext = extensionFor(contentType);
        String uuid = UUID.randomUUID().toString();
        return prefix + "/" + ownerId + "/" + uuid + ext;
    }

    /** Best-effort MIME → file extension. Empty string on unknown types. */
    static String extensionFor(String contentType) {
        if (contentType == null) {
            return "";
        }
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg", "image/jpg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "application/pdf" -> ".pdf";
            default -> "";
        };
    }
}
