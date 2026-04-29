package com.mediverse.bootstrap;

import io.github.cdimascio.dotenv.Dotenv;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.util.StringUtils;

/**
 * Loads a {@code .env} file into JVM {@linkplain System#setProperty system properties} before
 * Spring Boot starts so {@code application.yml} placeholders like {@code ${GOOGLE_CLIENT_ID:}}
 * resolve — Spring does not natively load dotenv/CWD files.
 *
 * <p>Searches upward from {@link Path#of(String) Path.of("")} (typically the Maven module dir)
 * toward the filesystem root until {@code .env} is found, so {@code backend/} cwd still finds the
 * monorepo root file.
 *
 * <p>Does not override OS environment variables or existing {@code -D} system properties so CI and
 * shell exports remain authoritative.
 */
public final class DotenvBootstrap {

    private DotenvBootstrap() {}

    public static void apply() {
        Path envPath = locateEnvFile();
        if (envPath == null) {
            return;
        }

        Dotenv dotenv =
                Dotenv.configure()
                        .directory(envPath.getParent().toString())
                        .filename(envPath.getFileName().toString())
                        .ignoreIfMalformed()
                        .ignoreIfMissing()
                        .load();

        dotenv.entries()
                .forEach(
                        entry -> {
                            String key = entry.getKey();
                            if (!StringUtils.hasText(key)) {
                                return;
                            }
                            if (hasExplicitExternal(key)) {
                                return;
                            }
                            String value = entry.getValue();
                            if (value != null) {
                                System.setProperty(key, value);
                            }
                        });
    }

    private static boolean hasExplicitExternal(String key) {
        String envVal = System.getenv(key);
        if (StringUtils.hasText(envVal)) {
            return true;
        }
        return System.getProperty(key) != null;
    }

    /** First {@code .env} climbing parents from cwd. */
    private static Path locateEnvFile() {
        Path dir = Path.of("").toAbsolutePath();
        for (int depth = 0; depth < 12; depth++) {
            Path candidate = dir.resolve(".env");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
            Path parent = dir.getParent();
            if (parent == null) {
                break;
            }
            dir = parent;
        }
        return null;
    }
}
