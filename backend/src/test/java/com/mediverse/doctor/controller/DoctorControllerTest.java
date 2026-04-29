package com.mediverse.doctor.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mediverse.auth.security.JwtAuthenticationFilter;
import com.mediverse.common.config.properties.StorageProperties;
import com.mediverse.doctor.dto.SpecializationOptionDto;
import com.mediverse.doctor.service.DoctorService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DoctorController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@EnableConfigurationProperties(StorageProperties.class)
class DoctorControllerTest {

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    DoctorService doctorService;

    @Autowired
    MockMvc mockMvc;

    @Test
    void specializations_returnsOk() throws Exception {
        when(doctorService.listSpecializationOptions())
                .thenReturn(
                        List.of(new SpecializationOptionDto("CARDIOLOGY", "Cardiology")));

        mockMvc.perform(get("/api/doctors/specializations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].code").value("CARDIOLOGY"));
    }
}
