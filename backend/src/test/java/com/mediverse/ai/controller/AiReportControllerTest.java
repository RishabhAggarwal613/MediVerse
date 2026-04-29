package com.mediverse.ai.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mediverse.ai.dto.AiReportDetailDto;
import com.mediverse.ai.dto.AiReportSummaryDto;
import com.mediverse.ai.service.AiReportService;
import com.mediverse.auth.security.JwtAuthenticationFilter;
import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.common.config.properties.StorageProperties;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AiReportController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@ImportAutoConfiguration(ValidationAutoConfiguration.class)
@EnableConfigurationProperties(StorageProperties.class)
class AiReportControllerTest {

    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean AiReportService aiReportService;

    @Autowired MockMvc mockMvc;

    @AfterEach
    void clear() {
        SecurityContextHolder.clearContext();
    }

    private static MediverseUserPrincipal patientPrincipal() {
        User u =
                User.builder()
                        .id(1L)
                        .email("pat@test.com")
                        .fullName("Pat")
                        .password("x")
                        .role(Role.PATIENT)
                        .emailVerified(true)
                        .build();
        return new MediverseUserPrincipal(u);
    }

    private void withPatient() {
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                patientPrincipal(), null, patientPrincipal().getAuthorities()));
    }

    @Test
    void list_reports_ok() throws Exception {
        withPatient();
        when(aiReportService.listMine(any()))
                .thenReturn(
                        List.of(
                                new AiReportSummaryDto(
                                        99L,
                                        "labs.pdf",
                                        "Brief…",
                                        "Dr. Ada",
                                        Instant.parse("2026-04-02T09:00:00Z"))));

        mockMvc.perform(get("/api/ai/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(99));

        verify(aiReportService).listMine(any());
    }

    @Test
    void scan_multipart_returnsDetail() throws Exception {
        withPatient();

        AiReportDetailDto dto =
                new AiReportDetailDto(
                        1L,
                        "x.pdf",
                        "Summary …",
                        List.of(),
                        "Rest",
                        null,
                        null,
                        Instant.parse("2026-04-03T09:00:00Z"),
                        "http://localhost:8080/uploads/reports/x",
                        true);

        when(aiReportService.scan(any(), any())).thenReturn(dto);

        MockMultipartFile file =
                new MockMultipartFile("file", "x.pdf", "application/pdf", new byte[] {1, 2, 3});

        mockMvc.perform(multipart("/api/ai/reports/scan").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));

        verify(aiReportService).scan(any(), any());
    }

    @Test
    void share_postJson() throws Exception {
        withPatient();

        AiReportDetailDto dto =
                new AiReportDetailDto(
                        1L,
                        "x.pdf",
                        "Summary",
                        List.of(),
                        "More",
                        7L,
                        "Dr Ada",
                        Instant.now(),
                        "http://u",
                        true);
        when(aiReportService.share(any(), eq(1L), any())).thenReturn(dto);

        mockMvc.perform(
                        post("/api/ai/reports/1/share")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"doctorId\":7}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.sharedDoctorId").value(7));

        verify(aiReportService).share(any(), eq(1L), any());
    }
}
