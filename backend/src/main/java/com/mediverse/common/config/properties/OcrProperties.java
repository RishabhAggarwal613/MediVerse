package com.mediverse.common.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * OCR configuration for the AI report scanner.
 *
 * <p>Binds {@code mediverse.ocr.*} in {@code application.yml}. This is intentionally separate
 * from {@link AppProperties} to avoid broad record signature changes.
 */
@ConfigurationProperties(prefix = "mediverse.ocr")
public record OcrProperties(
        String language,
        String tessdataPath,
        int minPdfTextChars,
        int maxOcrPages,
        int pdfOcrDpi,
        long maxRenderedPixels) {}

