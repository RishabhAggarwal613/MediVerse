package com.mediverse.ai.service;

import com.mediverse.ai.client.GeminiChatRemoteClient;
import com.mediverse.ai.domain.AiMessageRole;
import com.mediverse.ai.dto.AiHealthTipDto;
import com.mediverse.ai.dto.GeminiChatTurn;
import com.mediverse.common.api.ApiException;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** One cached wellness tip per UTC calendar day (singleton server cache). */
@Service
@RequiredArgsConstructor
public class AiHealthTipService {

    private static final String TIP_SYSTEM =
            """
You produce a single short daily wellness reminder for a general audience.
Output plain text only — at most 3 sentences. No diagnoses, no medication advice.
Be positive and practical.""";

    private final GeminiChatRemoteClient geminiChatRemoteClient;

    private final Map<String, String> dailyTipUtc = new ConcurrentHashMap<>();

    public AiHealthTipDto dailyTip(User caller) {
        if (caller.getRole() != Role.PATIENT) {
            throw ApiException.forbidden("Health tips are only available to patient accounts.");
        }
        String dayUtc = Instant.now().atZone(ZoneOffset.UTC).toLocalDate().toString();
        String text =
                dailyTipUtc.computeIfAbsent(dayUtc, d -> mintTipUtc(d));
        return new AiHealthTipDto(text, dayUtc, "UTC");
    }

    private String mintTipUtc(String dayUtcLabel) {
        var userProbe =
                new GeminiChatTurn(
                        AiMessageRole.USER,
                        "Give today's unique wellness reminder for calendar date " + dayUtcLabel + " (UTC).");

        String raw = geminiChatRemoteClient.generateModelReply(TIP_SYSTEM, List.of(userProbe));

        String cleaned = raw.replace("\r", "").trim();
        return cleaned.length() > 900 ? cleaned.substring(0, 897) + "…" : cleaned;
    }
}
