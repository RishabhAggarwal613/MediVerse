package com.mediverse.storage;

import com.mediverse.common.config.properties.StorageProperties;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Writes files under {@link StorageProperties.Local#baseDir baseDir} on the
 * host filesystem. Files are served back via a static-resource handler at
 * {@link StorageProperties.Local#publicUrlPrefix publicUrlPrefix} (set up
 * in {@code LocalStorageWebConfig}).
 *
 * <p>Active when {@code mediverse.storage.provider=LOCAL} (the default).
 *
 * <p>Suitable for dev only. Production should use {@code S3StorageService}.
 */
@Service
@ConditionalOnProperty(prefix = "mediverse.storage", name = "provider", havingValue = "LOCAL", matchIfMissing = true)
@Slf4j
public class LocalFsStorageService implements StorageService {

    private final Path baseDir;
    private final String publicUrlPrefix;

    public LocalFsStorageService(StorageProperties props) {
        this.baseDir = Path.of(props.local().baseDir()).toAbsolutePath().normalize();
        this.publicUrlPrefix = stripTrailingSlash(props.local().publicUrlPrefix());
    }

    @PostConstruct
    void initBaseDir() {
        try {
            Files.createDirectories(baseDir);
            log.info("LocalFsStorageService ready: baseDir={}, urlPrefix={}", baseDir, publicUrlPrefix);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to create local storage dir: " + baseDir, e);
        }
    }

    @Override
    public String upload(String key, byte[] bytes, String contentType) {
        Path target = resolveSafe(key);
        try {
            Files.createDirectories(target.getParent());
            Files.write(
                    target,
                    bytes,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING,
                    StandardOpenOption.WRITE);
            log.debug("Stored {} ({} bytes, {})", key, bytes.length, contentType);
            return key;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to write " + key, e);
        }
    }

    @Override
    public void delete(String key) {
        try {
            Files.deleteIfExists(resolveSafe(key));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to delete " + key, e);
        }
    }

    @Override
    public boolean exists(String key) {
        return Files.exists(resolveSafe(key));
    }

    @Override
    public String urlFor(String key) {
        return publicUrlPrefix + "/" + key;
    }

    /** Resolves {@code key} under {@link #baseDir}, refusing path traversal. */
    private Path resolveSafe(String key) {
        if (key == null || key.isBlank() || key.contains("\0")) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        Path resolved = baseDir.resolve(key).normalize();
        if (!resolved.startsWith(baseDir)) {
            throw new IllegalArgumentException("Storage key escapes baseDir: " + key);
        }
        return resolved;
    }

    private static String stripTrailingSlash(String s) {
        if (s == null || s.isEmpty()) {
            return "";
        }
        return s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }
}
