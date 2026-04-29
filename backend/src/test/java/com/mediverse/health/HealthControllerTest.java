package com.mediverse.health;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.mediverse.auth.security.JwtAuthenticationFilter;
import com.mediverse.common.config.properties.StorageProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Slice test for {@link HealthController} only.
 *
 * <p>{@link JwtAuthenticationFilter} is mocked because it is globally registered via
 * component-scan ({@link com.mediverse.MediverseApplication}) and pulls in {@code JwtService},
 * {@code JwtProperties}, etc. — none of which are needed here.
 */
@WebMvcTest(HealthController.class)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@EnableConfigurationProperties(StorageProperties.class)
class HealthControllerTest {

    @MockBean
    JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    MockMvc mockMvc;

    @Test
    void returnsOkEnvelope() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.service").value("mediverse"))
                .andExpect(jsonPath("$.data.timestamp").exists())
                .andExpect(jsonPath("$.error").doesNotExist());
    }
}
