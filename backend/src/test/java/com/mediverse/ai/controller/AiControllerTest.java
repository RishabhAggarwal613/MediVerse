package com.mediverse.ai.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mediverse.ai.dto.AiChatMessageDto;
import com.mediverse.ai.dto.AiChatSessionDto;
import com.mediverse.ai.dto.AiHealthTipDto;
import com.mediverse.ai.dto.SendAiChatMessagesResponseDto;
import com.mediverse.ai.service.AiChatService;
import com.mediverse.ai.service.AiHealthTipService;
import com.mediverse.auth.security.JwtAuthenticationFilter;
import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.common.config.properties.StorageProperties;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AiController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@EnableConfigurationProperties(StorageProperties.class)
class AiControllerTest {

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    AiChatService aiChatService;

    @MockBean
    AiHealthTipService aiHealthTipService;

    @Autowired
    MockMvc mockMvc;

    private static MediverseUserPrincipal patientPrincipal() {
        var user =
                com.mediverse.user.domain.User.builder()
                        .id(1L)
                        .email("p@example.com")
                        .fullName("Pat")
                        .password("x")
                        .role(com.mediverse.user.domain.Role.PATIENT)
                        .emailVerified(true)
                        .build();
        return new MediverseUserPrincipal(user);
    }

    private void withPatient() {
        var principal = patientPrincipal();
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    private void resetSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void healthTip_returnsEnvelope() throws Exception {
        withPatient();
        when(aiHealthTipService.dailyTip(any()))
                .thenReturn(new AiHealthTipDto("Hydrate gently.", "2026-04-29", "UTC"));

        mockMvc.perform(get("/api/ai/health-tip"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tip").value("Hydrate gently."))
                .andExpect(jsonPath("$.data.dayUtc").value("2026-04-29"));

        verify(aiHealthTipService).dailyTip(any());
        resetSecurityContext();
    }

    @Test
    void listSessions_returnsOk() throws Exception {
        withPatient();
        when(aiChatService.listSessions(any()))
                .thenReturn(
                        List.of(
                                new AiChatSessionDto(
                                        22L,
                                        "Hello",
                                        Instant.parse("2026-04-01T10:00:00Z"),
                                        Instant.parse("2026-04-01T10:05:00Z"))));

        mockMvc.perform(get("/api/ai/chat/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(22))
                .andExpect(jsonPath("$.data[0].title").value("Hello"));

        verify(aiChatService).listSessions(any());
        resetSecurityContext();
    }

    @Test
    void sendMessage_returnsBothBubbles() throws Exception {
        withPatient();

        AiChatMessageDto u =
                new AiChatMessageDto(90L, "USER", "hi", Instant.parse("2026-04-02T09:00:00Z"));
        AiChatMessageDto a =
                new AiChatMessageDto(91L, "ASSISTANT", "Hello.", Instant.parse("2026-04-02T09:00:01Z"));
        when(aiChatService.send(any(), eq(5L), any()))
                .thenReturn(new SendAiChatMessagesResponseDto(u, a));

        mockMvc.perform(
                        post("/api/ai/chat/sessions/5/messages")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"content\":\"hi\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userMessage.role").value("USER"))
                .andExpect(jsonPath("$.data.assistantMessage.role").value("ASSISTANT"));

        verify(aiChatService).send(any(), eq(5L), any());
        resetSecurityContext();
    }
}
