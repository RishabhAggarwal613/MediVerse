package com.mediverse.storage;

import com.mediverse.common.config.properties.AwsProperties;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

/**
 * AWS S3 implementation. Active when {@code mediverse.storage.provider=S3}.
 * Files are written directly; reads go through short-lived presigned GET URLs
 * (default 15 min) so the bucket can stay private.
 */
@Service
@ConditionalOnProperty(prefix = "mediverse.storage", name = "provider", havingValue = "S3")
@Slf4j
public class S3StorageService implements StorageService {

    private static final Duration PRESIGN_TTL = Duration.ofMinutes(15);

    private final String bucket;
    private final S3Client s3;
    private final S3Presigner presigner;

    public S3StorageService(AwsProperties props) {
        if (props.s3() == null
                || props.s3().bucket() == null
                || props.s3().accessKey() == null
                || props.s3().secretKey() == null) {
            throw new IllegalStateException(
                    "S3 storage selected (mediverse.storage.provider=S3) but aws.s3.* config is incomplete");
        }
        Region region = Region.of(props.region());
        StaticCredentialsProvider creds = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(props.s3().accessKey(), props.s3().secretKey()));
        this.s3 = S3Client.builder().region(region).credentialsProvider(creds).build();
        this.presigner = S3Presigner.builder().region(region).credentialsProvider(creds).build();
        this.bucket = props.s3().bucket();
    }

    @PostConstruct
    void logBoot() {
        log.info("S3StorageService ready: bucket={}", bucket);
    }

    @PreDestroy
    void close() {
        try {
            presigner.close();
        } catch (Exception ignored) {
        }
        try {
            s3.close();
        } catch (Exception ignored) {
        }
    }

    @Override
    public String upload(String key, byte[] bytes, String contentType) {
        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .contentLength((long) bytes.length)
                        .build(),
                RequestBody.fromBytes(bytes));
        return key;
    }

    @Override
    public void delete(String key) {
        s3.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
    }

    @Override
    public boolean exists(String key) {
        try {
            s3.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build());
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        }
    }

    @Override
    public String urlFor(String key) {
        GetObjectPresignRequest req = GetObjectPresignRequest.builder()
                .signatureDuration(PRESIGN_TTL)
                .getObjectRequest(b -> b.bucket(bucket).key(key))
                .build();
        return presigner.presignGetObject(req).url().toString();
    }
}
