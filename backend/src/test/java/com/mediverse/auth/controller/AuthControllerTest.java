package com.mediverse.auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediverse.auth.dto.AuthResponse;
import com.mediverse.auth.dto.LoginRequest;
import com.mediverse.auth.dto.RegisterPatientRequest;
import com.mediverse.auth.dto.UserDto;
import com.mediverse.auth.security.JwtAuthenticationFilter;
import com.mediverse.auth.service.AuthService;
import com.mediverse.common.config.properties.StorageProperties;
import com.mediverse.user.domain.Role;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@EnableConfigurationProperties(StorageProperties.class)
class AuthControllerTest {

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    AuthService authService;

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    void registerPatient_returnsCreatedWithEnvelope() throws Exception {
        UserDto userDto = new UserDto(1L, "pat@example.com", "Pat", Role.PATIENT, false, null);
        AuthResponse auth =
                AuthResponse.of(
                        "access",
                        "refresh",
                        Instant.parse("2026-01-01T00:00:00Z"),
                        Instant.parse("2026-01-08T00:00:00Z"),
                        userDto);
        when(authService.registerPatient(any(RegisterPatientRequest.class))).thenReturn(auth);

        mockMvc.perform(
                        post("/api/auth/register/patient")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {
                                          "email": "pat@example.com",
                                          "password": "secret12",
                                          "fullName": "Pat",
                                          "phone": null
                                        }
                                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("access"))
                .andExpect(jsonPath("$.data.user.email").value("pat@example.com"));
    }

    @Test
    void login_returnsOkWithEnvelope() throws Exception {
        UserDto userDto = new UserDto(1L, "u@example.com", "U", Role.PATIENT, true, null);
        AuthResponse auth =
                AuthResponse.of(
                        "a",
                        "r",
                        Instant.parse("2026-01-01T00:00:00Z"),
                        Instant.parse("2026-01-08T00:00:00Z"),
                        userDto);
        when(authService.login(any(LoginRequest.class))).thenReturn(auth);

        mockMvc.perform(
                        post("/api/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(new LoginRequest("u@example.com", "pw"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
    }

    @Test
    void forgotPassword_returnsOk_evenWhenServiceNoops() throws Exception {
        mockMvc.perform(
                        post("/api/auth/forgot-password")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"unknown@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(authService).forgotPassword("unknown@example.com");
    }

    @Test
    void logout_returnsOk() throws Exception {
        mockMvc.perform(
                        post("/api/auth/logout")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"refreshToken\":\"rt\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(authService).logout(any());
    }

    @Test
    void registerDoctor_multipart_returnsCreated() throws Exception {
        UserDto userDto =
                new UserDto(2L, "doc@example.com", "Doc", Role.DOCTOR, false, null);
        AuthResponse auth =
                AuthResponse.of(
                        "da",
                        "dr",
                        Instant.parse("2026-01-01T00:00:00Z"),
                        Instant.parse("2026-01-08T00:00:00Z"),
                        userDto);
        when(authService.registerDoctor(any(), any())).thenReturn(auth);

        String json =
                """
                {
                  "email": "doc@example.com",
                  "password": "secret12",
                  "fullName": "Doc",
                  "phone": null,
                  "specialization": "Cardiology",
                  "qualifications": "MD",
                  "licenseNumber": "LIC-001",
                  "yearsExperience": 5,
                  "consultationFee": 100.0,
                  "bio": "Hello"
                }
                """;
        MockMultipartFile data =
                new MockMultipartFile("data", "", "application/json", json.getBytes());
        MockMultipartFile license =
                new MockMultipartFile(
                        "license",
                        "lic.pdf",
                        "application/pdf",
                        "%PDF-1.4 test".getBytes());

        mockMvc.perform(
                        multipart("/api/auth/register/doctor")
                                .file(data)
                                .file(license)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.user.role").value("DOCTOR"));
    }

    @Test
    void verifyEmail_returnsOk() throws Exception {
        mockMvc.perform(
                        post("/api/auth/verify-email")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"token\":\"raw-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(authService).verifyEmail("raw-token");
    }

    @Test
    void resetPassword_returnsOk() throws Exception {
        mockMvc.perform(
                        post("/api/auth/reset-password")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {"token":"t","newPassword":"newpass12"}
                                        """))
                .andExpect(status().isOk());

        verify(authService).resetPassword(eq("t"), eq("newpass12"));
    }
}
