package com.mediverse.storage;

import com.mediverse.common.config.properties.StorageProperties;
import java.nio.file.Path;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Maps {@code /uploads/**} → {@link StorageProperties.Local#baseDir} so the
 * local-fs adapter has a way to serve uploaded files in dev. Only registered
 * when {@code mediverse.storage.provider=LOCAL}.
 *
 * <p>Files served here are publicly readable. That's a conscious dev-only
 * trade-off; production switches to S3 + presigned URLs.
 */
@Configuration
@ConditionalOnProperty(prefix = "mediverse.storage", name = "provider", havingValue = "LOCAL", matchIfMissing = true)
@RequiredArgsConstructor
@Slf4j
public class LocalStorageWebConfig implements WebMvcConfigurer {

    private final StorageProperties props;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path base = Path.of(props.local().baseDir()).toAbsolutePath().normalize();
        String location = base.toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
        log.info("Static handler /uploads/** -> {}", location);
    }
}
