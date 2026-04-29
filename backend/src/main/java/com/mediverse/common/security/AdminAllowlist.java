package com.mediverse.common.security;

import com.mediverse.common.config.properties.AppProperties;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.springframework.stereotype.Component;

@Component
public final class AdminAllowlist {

    private final AppProperties appProperties;

    public AdminAllowlist(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    /** True when {@code ADMIN_EMAILS} / {@code mediverse.admin.emails} contains this email (case-insensitive trim). */
    public boolean contains(String email) {
        List<String> admins = appProperties.admin() != null ? appProperties.admin().emails() : null;
        if (admins == null || admins.isEmpty() || email == null || email.isBlank()) {
            return false;
        }
        String n = email.trim().toLowerCase(Locale.ROOT);
        return admins.stream()
                .filter(Objects::nonNull)
                .map(e -> e.trim().toLowerCase(Locale.ROOT))
                .anyMatch(n::equals);
    }
}
