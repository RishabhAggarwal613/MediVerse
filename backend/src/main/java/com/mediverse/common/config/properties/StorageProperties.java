package com.mediverse.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Selects and configures the {@code StorageService} adapter.
 *
 * <p>For local dev: {@code provider: LOCAL} writes files to disk under
 * {@link Local#baseDir}. For prod: {@code provider: S3} delegates to the
 * AWS S3 adapter (configured via {@link AwsProperties}).
 */
@ConfigurationProperties(prefix = "mediverse.storage")
public record StorageProperties(
        Provider provider,
        Local local) {

    public enum Provider {
        LOCAL,
        S3
    }

    public record Local(String baseDir, String publicUrlPrefix) {}
}
