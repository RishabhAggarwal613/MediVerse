package com.mediverse.common.config.properties;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound to all {@code mediverse.*} properties in {@code application.yml}.
 *
 * <p>Comma-separated env-var values (e.g. {@code CORS_ALLOWED_ORIGINS=a,b,c}) are bound to
 * {@code List<String>} automatically by Spring Boot's relaxed-binding rules.
 */
@ConfigurationProperties(prefix = "mediverse")
public record AppProperties(
        Cors cors,
        Admin admin,
        Appointment appointment,
        Mail mail) {

    public record Cors(List<String> allowedOrigins) {}

    public record Admin(List<String> emails) {}

    public record Appointment(int bookingHorizonDays, int cancelWindowHours) {}

    public record Mail(String from) {}
}
