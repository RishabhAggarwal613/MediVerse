package com.mediverse.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Typed view of {@code aws.*} env vars (used only when storage provider is {@code S3}). */
@ConfigurationProperties(prefix = "aws")
public record AwsProperties(
        String region,
        S3 s3) {

    public record S3(
            String bucket,
            String accessKey,
            String secretKey) {}
}
