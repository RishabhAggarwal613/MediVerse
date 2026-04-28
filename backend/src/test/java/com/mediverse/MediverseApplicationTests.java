package com.mediverse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test — boots the full Spring context against the in-memory H2 database (test profile) to
 * verify all configuration beans wire up correctly: properties, security, CORS, OpenAPI, exception
 * handler, and the health controller.
 */
@SpringBootTest
@ActiveProfiles("test")
class MediverseApplicationTests {

    @Test
    void contextLoads() {
    }
}
