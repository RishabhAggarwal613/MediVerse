package com.mediverse.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Springdoc / Swagger UI configuration. Adds a global {@code bearerAuth} security scheme so the
 * "Authorize" button in {@code /swagger-ui.html} accepts a JWT (used from Phase 2 onwards).
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI mediverseOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MediVerse API")
                        .description("AI-powered medical platform — backend API")
                        .version("v0.1.0")
                        .contact(new Contact().name("MediVerse").email("dev@mediverse.local"))
                        .license(new License().name("Proprietary")))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME,
                                new SecurityScheme()
                                        .name(SECURITY_SCHEME_NAME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Paste an access token (without the 'Bearer ' prefix).")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME));
    }
}
