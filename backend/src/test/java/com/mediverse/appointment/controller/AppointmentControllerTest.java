package com.mediverse.appointment.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mediverse.appointment.dto.AppointmentDto;
import com.mediverse.appointment.service.AppointmentService;
import com.mediverse.auth.security.JwtAuthenticationFilter;
import com.mediverse.auth.security.MediverseUserPrincipal;
import com.mediverse.common.config.properties.StorageProperties;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AppointmentController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@EnableConfigurationProperties(StorageProperties.class)
class AppointmentControllerTest {

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    AppointmentService appointmentService;

    @Autowired
    MockMvc mockMvc;

    @Test
    void listMine_returnsOk() throws Exception {
        var user =
                com.mediverse.user.domain.User.builder()
                        .id(1L)
                        .email("p@example.com")
                        .fullName("Pat")
                        .password("x")
                        .role(com.mediverse.user.domain.Role.PATIENT)
                        .emailVerified(true)
                        .build();
        var principal = new MediverseUserPrincipal(user);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));

        when(appointmentService.listMine(any(), any()))
                .thenReturn(
                        List.of(
                                new AppointmentDto(
                                        10L,
                                        "CONFIRMED",
                                        "2026-06-01T10:30:00",
                                        88L,
                                        3L,
                                        2L,
                                        "Pat",
                                        "Doc",
                                        "p@example.com",
                                        "d@example.com",
                                        "cold",
                                        null)));

        mockMvc.perform(get("/api/appointments/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data[0].doctorName").value("Doc"));

        verify(appointmentService).listMine(any(), any());
        SecurityContextHolder.clearContext();
    }
}
