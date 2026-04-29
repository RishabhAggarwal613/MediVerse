package com.mediverse.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Google Generative Language API (Gemini) — binds {@code gemini.*} in {@code application.yml}. */
@ConfigurationProperties(prefix = "gemini")
public record GeminiProperties(String apiKey, String chatModel, String visionModel) {}
