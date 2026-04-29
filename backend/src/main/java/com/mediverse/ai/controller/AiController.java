package com.mediverse.ai.controller;

import com.mediverse.ai.dto.AiChatMessageDto;
import com.mediverse.ai.dto.AiChatSessionDto;
import com.mediverse.ai.dto.AiHealthTipDto;
import com.mediverse.ai.dto.CreateAiChatSessionRequest;
import com.mediverse.ai.dto.SendAiChatMessageRequest;
import com.mediverse.ai.dto.SendAiChatMessagesResponseDto;
import com.mediverse.ai.service.AiChatService;
import com.mediverse.ai.service.AiHealthTipService;
import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.common.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiChatService aiChatService;
    private final AiHealthTipService aiHealthTipService;

    @PostMapping("/chat/sessions")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<AiChatSessionDto> createSession(
            @AuthenticationPrincipal MediverseUserPrincipal principal,
            @RequestBody(required = false) @Valid CreateAiChatSessionRequest body) {
        CreateAiChatSessionRequest safe = body == null ? new CreateAiChatSessionRequest(null) : body;
        return ApiResponse.ok(aiChatService.createSession(principal.user(), safe));
    }

    @GetMapping("/chat/sessions")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<List<AiChatSessionDto>> listSessions(@AuthenticationPrincipal MediverseUserPrincipal principal) {
        return ApiResponse.ok(aiChatService.listSessions(principal.user()));
    }

    @GetMapping("/chat/sessions/{id}/messages")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<List<AiChatMessageDto>> messages(
            @AuthenticationPrincipal MediverseUserPrincipal principal, @PathVariable("id") long sessionId) {
        return ApiResponse.ok(aiChatService.listMessages(principal.user(), sessionId));
    }

    @PostMapping("/chat/sessions/{id}/messages")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<SendAiChatMessagesResponseDto> sendMessage(
            @AuthenticationPrincipal MediverseUserPrincipal principal,
            @PathVariable("id") long sessionId,
            @Valid @RequestBody SendAiChatMessageRequest body) {
        return ApiResponse.ok(aiChatService.send(principal.user(), sessionId, body));
    }

    @GetMapping("/health-tip")
    @PreAuthorize("hasRole('PATIENT')")
    public ApiResponse<AiHealthTipDto> healthTip(@AuthenticationPrincipal MediverseUserPrincipal principal) {
        return ApiResponse.ok(aiHealthTipService.dailyTip(principal.user()));
    }
}
