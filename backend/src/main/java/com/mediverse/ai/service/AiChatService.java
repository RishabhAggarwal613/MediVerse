package com.mediverse.ai.service;

import com.mediverse.ai.client.GeminiChatRemoteClient;
import com.mediverse.ai.domain.AiChatMessage;
import com.mediverse.ai.domain.AiChatSession;
import com.mediverse.ai.domain.AiMessageRole;
import com.mediverse.ai.dto.AiChatMessageDto;
import com.mediverse.ai.dto.AiChatSessionDto;
import com.mediverse.ai.dto.CreateAiChatSessionRequest;
import com.mediverse.ai.dto.SendAiChatMessageRequest;
import com.mediverse.ai.dto.SendAiChatMessagesResponseDto;
import com.mediverse.ai.dto.GeminiChatTurn;
import com.mediverse.ai.repository.AiChatMessageRepository;
import com.mediverse.ai.repository.AiChatSessionRepository;
import com.mediverse.common.api.ApiException;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import com.mediverse.user.repository.UserRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiChatService {

    private static final String SYSTEM_PROMPT =
            """
You are MediVerse AI Health Assistant — a wellness education aide.
Provide general lifestyle and health literacy guidance only.

Rules:
• Never diagnose illnesses or interpret individual lab values as definitive.
• Never prescribe medications, dosing, or stop/start treatment instructions.
• If symptoms could indicate an emergency or serious condition, urge seeking urgent or emergency medical care immediately.
• Be concise (a few paragraphs at most unless the user asks for detail). Stay warm and professional.""";

    private final AiChatSessionRepository sessionRepository;
    private final AiChatMessageRepository messageRepository;
    private final GeminiChatRemoteClient geminiChatRemoteClient;
    private final UserRepository userRepository;

    @Transactional
    public AiChatSessionDto createSession(User caller, CreateAiChatSessionRequest req) {
        assertPatient(caller);

        AiChatSession entity =
                AiChatSession.builder()
                        .user(userRepository.getReferenceById(caller.getId()))
                        .title(trimTitle(req))
                        .build();
        AiChatSession saved = sessionRepository.saveAndFlush(entity);
        return toSessionDto(saved);
    }

    @Transactional(readOnly = true)
    public List<AiChatSessionDto> listSessions(User caller) {
        assertPatient(caller);
        return sessionRepository.findByUser_IdOrderByUpdatedAtDesc(caller.getId()).stream()
                .map(this::toSessionDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AiChatMessageDto> listMessages(User caller, long sessionId) {
        assertPatient(caller);
        AiChatSession session = loadOwnedSession(sessionId, caller.getId());
        return messageRepository.findBySession_IdOrderByCreatedAtAsc(session.getId()).stream()
                .map(this::toMessageDto)
                .toList();
    }

    /**
     * Persists the user bubble first; Gemini failures propagate as {@link ApiException}
     * <strong>without</strong> rolling back the saved user message ({@link ApiException}
     * configured as {@code noRollbackFor} below).
     */
    @Transactional(noRollbackFor = ApiException.class)
    public SendAiChatMessagesResponseDto send(User caller, long sessionId, SendAiChatMessageRequest body) {
        assertPatient(caller);

        AiChatSession session =
                sessionRepository
                        .findByIdAndUser_Id(sessionId, caller.getId())
                        .orElseThrow(() -> ApiException.notFound("Chat session not found"));

        String trimmed = body.content().trim();
        AiChatMessage userRow = new AiChatMessage();
        userRow.setSession(session);
        userRow.setRole(AiMessageRole.USER);
        userRow.setContent(trimmed);
        messageRepository.saveAndFlush(userRow);

        maybeSetTitleFromFirstUserMessage(session, trimmed);
        session.setUpdatedAt(Instant.now());
        sessionRepository.saveAndFlush(session);

        List<AiChatMessage> chronological = messageRepository.findBySession_IdOrderByCreatedAtAsc(session.getId());

        List<GeminiChatTurn> turns =
                chronological.stream().map(m -> new GeminiChatTurn(m.getRole(), m.getContent())).toList();

        String assistantPlain =
                geminiChatRemoteClient.generateModelReply(SYSTEM_PROMPT, new ArrayList<>(turns));

        AiChatMessage asst = new AiChatMessage();
        asst.setSession(session);
        asst.setRole(AiMessageRole.ASSISTANT);
        asst.setContent(assistantPlain);
        messageRepository.saveAndFlush(asst);

        session.setUpdatedAt(Instant.now());
        sessionRepository.save(session);

        return new SendAiChatMessagesResponseDto(toMessageDto(userRow), toMessageDto(asst));
    }

    private void maybeSetTitleFromFirstUserMessage(AiChatSession session, String trimmed) {
        if (session.getTitle() != null && !session.getTitle().isBlank()) {
            return;
        }
        String t =
                trimmed.length() > 60
                        ? trimmed.substring(0, 57).trim() + "…"
                        : trimmed;
        session.setTitle(t.isBlank() ? "New conversation" : t);
    }

    private AiChatSession loadOwnedSession(Long sessionId, Long userId) {
        return sessionRepository
                .findByIdAndUser_Id(sessionId, userId)
                .orElseThrow(() -> ApiException.notFound("Chat session not found"));
    }

    private static String trimTitle(CreateAiChatSessionRequest req) {
        if (req == null || req.title() == null) {
            return null;
        }
        String t = req.title().trim();
        return t.isEmpty() ? null : t.substring(0, Math.min(t.length(), 200));
    }

    private AiChatSessionDto toSessionDto(AiChatSession s) {
        return new AiChatSessionDto(s.getId(), s.getTitle(), s.getCreatedAt(), s.getUpdatedAt());
    }

    private AiChatMessageDto toMessageDto(AiChatMessage m) {
        return new AiChatMessageDto(m.getId(), m.getRole().name(), m.getContent(), m.getCreatedAt());
    }

    private static void assertPatient(User caller) {
        if (caller.getRole() != Role.PATIENT) {
            throw ApiException.forbidden("AI assistant is only available to patient accounts.");
        }
    }
}
