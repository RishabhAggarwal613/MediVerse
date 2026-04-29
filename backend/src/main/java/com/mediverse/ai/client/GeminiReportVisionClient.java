package com.mediverse.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediverse.ai.domain.AiReportFindingSnapshot;
import com.mediverse.common.api.ApiException;
import com.mediverse.common.config.properties.GeminiProperties;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestClient;

/** Gemini {@code :generateContent} for single multimodal report uploads (vision / PDF). */
@Component
@Slf4j
public class GeminiReportVisionClient {

    private static final Duration CONNECT = Duration.ofSeconds(15);
    private static final Duration READ = Duration.ofMinutes(3);

    private static final String JSON_INSTRUCTION =
            """
            You analyze medical lab reports (images or PDF pages). Use only the attached file.
            Output a single JSON object with this exact structure and no other text before or after:
            {
              "summary": "2-4 sentences in plain language for a patient; no diagnosis; note this is AI-generated.",
              "findings": [
                { "label": "Test name", "value": "reading or text", "unit": "optional", "refRange": "optional", "flag": "HIGH|LOW|ABNORMAL|NORMAL|NOTE" }
              ],
              "recommendations": "Short practical next steps; urge consulting a clinician for interpretation."
            }
            If unsure, use conservative language. Use empty findings array if nothing can be read.
            """;

    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public GeminiReportVisionClient(GeminiProperties geminiProperties, ObjectMapper objectMapper) {
        this.geminiProperties = geminiProperties;
        this.objectMapper = objectMapper;

        java.net.http.HttpClient jdk =
                java.net.http.HttpClient.newBuilder().connectTimeout(CONNECT).build();
        org.springframework.http.client.JdkClientHttpRequestFactory factory =
                new org.springframework.http.client.JdkClientHttpRequestFactory(jdk);
        factory.setReadTimeout(READ);

        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    /**
     * Runs vision model on {@code bytes}; returns parsed summary/findings/recommendations and full
     * Gemini HTTP JSON for traceability.
     */
    public GeminiReportParseResult analyzeReport(byte[] bytes, String mimeType) throws ApiException {
        String apiKey = geminiProperties.apiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw ApiException.badRequest("AI is disabled: set GEMINI_API_KEY in your environment (.env)");
        }
        if (bytes == null || bytes.length == 0) {
            throw ApiException.badRequest("Empty file");
        }
        String safeMime = sanitizeMime(mimeType);

        String modelId = sanitizeModelId(geminiProperties.visionModel());
        String b64 = Base64.getEncoder().encodeToString(bytes);

        Map<String, Object> inline = new LinkedHashMap<>();
        inline.put("mime_type", safeMime);
        inline.put("data", b64);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put(
                "contents",
                List.of(
                        Map.of(
                                "role",
                                "user",
                                "parts",
                                List.of(Map.of("text", JSON_INSTRUCTION), Map.of("inline_data", inline)))));
        body.put("generationConfig", Map.of("maxOutputTokens", 4096, "temperature", 0.2));

        byte[] serialized;
        try {
            serialized = objectMapper.writeValueAsBytes(body);
        } catch (Exception e) {
            throw ApiException.upstreamUnavailable("Could not serialize Gemini vision request");
        }

        URI uri =
                URI.create(
                        "https://generativelanguage.googleapis.com/v1beta/models/"
                                + modelId
                                + ":generateContent?key="
                                + urlEncodeUtf8(apiKey));

        byte[] respBytes;
        try {
            respBytes =
                    restClient
                            .post()
                            .uri(uri)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(serialized)
                            .retrieve()
                            .body(byte[].class);
        } catch (RestClientResponseException e) {
            String preview = shortenUtf8(e.getResponseBodyAsByteArray(), 500);
            int sc = e.getStatusCode().value();
            log.warn("Gemini Vision HTTP {} preview={}", sc, preview.isBlank() ? "(empty)" : preview);
            throw ApiException.upstreamUnavailable(
                    "Gemini rejected the request (HTTP "
                            + sc
                            + ")"
                            + (preview.isBlank() ? "" : ". " + preview));
        } catch (ResourceAccessException e) {
            log.warn("Gemini Vision network/read failure", e);
            throw ApiException.upstreamUnavailable(
                    "Could not reach Gemini (network or timeouts). Try again shortly.");
        } catch (RestClientException e) {
            log.warn("Gemini Vision RestClient failure", e);
            throw ApiException.upstreamUnavailable(
                    "Gemini HTTP error: "
                            + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
        }

        if (respBytes == null || respBytes.length == 0) {
            throw ApiException.upstreamUnavailable("Empty Gemini HTTP body");
        }

        JsonNode root;
        try {
            root = objectMapper.readTree(respBytes);
        } catch (Exception e) {
            throw ApiException.upstreamUnavailable("Invalid Gemini response JSON");
        }
        if (root.has("error")) {
            String msg = root.path("error").path("message").asText("Gemini error");
            log.warn("Gemini error envelope: {}", root.path("error"));
            throw ApiException.upstreamUnavailable(msg);
        }

        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            throw ApiException.upstreamUnavailable("No Gemini candidates");
        }
        JsonNode first = candidates.get(0);
        String finishText = first.path("finishReason").asText("");
        if (finishText.contains("SAFETY")) {
            throw ApiException.badRequest("The model could not analyze this file due to safety policy.");
        }

        StringBuilder out = new StringBuilder();
        for (JsonNode p : first.path("content").path("parts")) {
            out.append(p.path("text").asText(""));
        }
        String rawText = stripJsonFence(out.toString().trim());
        if (rawText.isEmpty()) {
            throw ApiException.upstreamUnavailable("Gemini returned empty text");
        }

        JsonNode parsed;
        try {
            parsed = objectMapper.readTree(rawText);
        } catch (Exception e) {
            log.warn("Gemini report JSON parse failure, raw prefix: {}", shortenUtf8(rawText.getBytes(StandardCharsets.UTF_8), 400));
            throw ApiException.upstreamUnavailable(
                    "Gemini did not return parseable JSON for the report. Try a clearer scan or another file.");
        }

        String summary = parsed.path("summary").asText("").strip();
        String recommendations = parsed.path("recommendations").asText("").strip();
        if (summary.isEmpty()) {
            throw ApiException.upstreamUnavailable("Gemini JSON missing summary field");
        }

        List<AiReportFindingSnapshot> findings = new ArrayList<>();
        JsonNode arr = parsed.path("findings");
        if (arr.isArray()) {
            for (JsonNode row : arr) {
                findings.add(
                        new AiReportFindingSnapshot(
                                textOrNull(row, "label"),
                                textOrNull(row, "value"),
                                textOrNull(row, "unit"),
                                textOrNull(row, "refRange"),
                                textOrNull(row, "flag")));
            }
        }

        return new GeminiReportParseResult(summary, findings, recommendations, root);
    }

    /** Result of a successful vision parse — ready to persist. */
    public record GeminiReportParseResult(
            String summary,
            List<AiReportFindingSnapshot> findings,
            String recommendations,
            JsonNode rawGeminiEnvelope) {}

    private static String textOrNull(JsonNode row, String field) {
        JsonNode n = row.path(field);
        String t = n.isMissingNode() || n.isNull() ? "" : n.asText("");
        String s = t.strip();
        return s.isEmpty() ? null : s;
    }

    private static String stripJsonFence(String s) {
        String t = s.strip();
        if (t.startsWith("```")) {
            int firstNl = t.indexOf('\n');
            if (firstNl > 0) {
                t = t.substring(firstNl + 1);
            }
            int end = t.lastIndexOf("```");
            if (end > 0) {
                t = t.substring(0, end).strip();
            }
        }
        return t;
    }

    private static String sanitizeMime(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "application/octet-stream";
        }
        String ct = contentType.split(";", 2)[0].strip().toLowerCase();
        return switch (ct) {
            case "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "application/pdf" -> ct;
            default -> ct;
        };
    }

    private static String sanitizeModelId(String raw) {
        if (raw == null || raw.isBlank()) {
            return "gemini-2.5-pro";
        }
        String trimmed = raw.trim();
        if (trimmed.startsWith("models/")) {
            return trimmed.substring("models/".length());
        }
        return trimmed;
    }

    private static String urlEncodeUtf8(String apiKey) {
        return java.net.URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
    }

    private static String shortenUtf8(byte[] bytes, int maxChars) {
        if (bytes == null || bytes.length == 0) {
            return "";
        }
        try {
            String s = new String(bytes, StandardCharsets.UTF_8).strip().replace('\n', ' ');
            return s.length() <= maxChars ? s : s.substring(0, maxChars).trim() + "…";
        } catch (Exception ignored) {
            return "";
        }
    }
}
