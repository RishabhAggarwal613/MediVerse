package com.mediverse.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediverse.ai.dto.GeminiChatTurn;
import com.mediverse.common.api.ApiException;
import com.mediverse.common.config.properties.GeminiProperties;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
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

/**
 * Gemini Generative Language API {@code :generateContent}.
 *
 * <p>Uses {@link JdkClientHttpRequestFactory#setReadTimeout(Duration)} for long completions.
 */
@Component
@Slf4j
public class GeminiChatRemoteClient {

    /** Budget for summarised textual history (~40 turns). */
    private static final int MAX_HISTORY_CHARS = 80_000;

    private static final Duration CONNECT = Duration.ofSeconds(15);
    private static final Duration READ = Duration.ofMinutes(2);

    private final GeminiProperties geminiProperties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public GeminiChatRemoteClient(GeminiProperties geminiProperties, ObjectMapper objectMapper) {
        this.geminiProperties = geminiProperties;
        this.objectMapper = objectMapper;

        java.net.http.HttpClient jdk =
                java.net.http.HttpClient.newBuilder().connectTimeout(CONNECT).build();
        org.springframework.http.client.JdkClientHttpRequestFactory factory =
                new org.springframework.http.client.JdkClientHttpRequestFactory(jdk);
        factory.setReadTimeout(READ);

        this.restClient =
                RestClient.builder().requestFactory(factory).build();
    }

    public String generateModelReply(String systemPrompt, List<GeminiChatTurn> conversation)
            throws ApiException {

        String apiKey = geminiProperties.apiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw ApiException.badRequest(
                    "AI is disabled: set GEMINI_API_KEY in your environment (.env)");
        }

        List<GeminiChatTurn> clipped = retainNewestWithinBudget(conversation);
        List<Map<String, Object>> geminiContents = new ArrayList<>();
        for (GeminiChatTurn t : clipped) {
            geminiContents.add(
                    Map.of(
                            "role",
                            t.geminiRole(),
                            "parts",
                            List.of(Map.of("text", t.text()))));
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))));
        body.put("contents", geminiContents);
        body.put("generationConfig", Map.of("maxOutputTokens", 2048, "temperature", 0.7));

        byte[] serialized;
        try {
            serialized = objectMapper.writeValueAsBytes(body);
        } catch (Exception e) {
            throw ApiException.upstreamUnavailable("Could not serialize Gemini request");
        }

        String modelId = sanitizeModelId(geminiProperties.chatModel());
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
            log.warn(
                    "Gemini HTTP {} on model {} preview={}",
                    sc,
                    modelId,
                    preview.isBlank() ? "(empty)" : preview);
            throw ApiException.upstreamUnavailable(
                    "Gemini rejected the request (HTTP "
                            + sc
                            + ")"
                            + (preview.isBlank() ? "" : ". " + preview));
        } catch (ResourceAccessException e) {
            log.warn("Gemini network/read failure", e);
            throw ApiException.upstreamUnavailable(
                    "Could not reach Gemini (network or timeouts). Try again shortly.");
        } catch (RestClientException e) {
            log.warn("Gemini RestClient failure", e);
            throw ApiException.upstreamUnavailable(
                    "Gemini HTTP error: "
                            + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
        }

        if (respBytes == null || respBytes.length == 0) {
            throw ApiException.upstreamUnavailable("Empty Gemini HTTP body");
        }

        try {
            JsonNode root = objectMapper.readTree(respBytes);
            if (root.has("error")) {
                String msg = root.path("error").path("message").asText("Gemini error");
                log.warn("Gemini error: {}", root.path("error"));
                throw ApiException.upstreamUnavailable(msg);
            }

            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.size() == 0) {
                throw ApiException.upstreamUnavailable("No Gemini candidates");
            }

            JsonNode first = candidates.get(0);
            JsonNode finish = first.path("finishReason");
            String finishText = finish.isMissingNode() ? "" : finish.asText("");
            if (finishText.contains("SAFETY")) {
                throw ApiException.badRequest(
                        "The assistant could not reply to this message due to safety policy.");
            }

            JsonNode parts = first.path("content").path("parts");
            StringBuilder out = new StringBuilder();
            for (JsonNode p : parts) {
                out.append(p.path("text").asText(""));
            }
            String text = out.toString().trim();
            if (text.isEmpty()) {
                throw ApiException.upstreamUnavailable("Gemini returned empty text");
            }
            return text;
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Gemini parse failure", e);
            throw ApiException.upstreamUnavailable("Invalid Gemini response JSON");
        }
    }

    private static List<GeminiChatTurn> retainNewestWithinBudget(List<GeminiChatTurn> chronological) {
        List<GeminiChatTurn> out = new ArrayList<>();
        long acc = 0;
        for (int i = chronological.size() - 1; i >= 0; i--) {
            GeminiChatTurn row = chronological.get(i);
            int len = row.text().length();
            if (acc + len > MAX_HISTORY_CHARS) {
                break;
            }
            out.addFirst(row);
            acc += len;
        }
        return out;
    }

    private static String sanitizeModelId(String raw) {
        if (raw == null || raw.isBlank()) {
            return "gemini-2.5-flash";
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

    /** Short UTF-8 preview for Gemini error payloads (quotes / JSON blobs). */
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
