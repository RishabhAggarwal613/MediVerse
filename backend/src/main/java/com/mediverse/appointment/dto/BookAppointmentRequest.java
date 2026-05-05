package com.mediverse.appointment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** Request body when booking via {@code POST /appointments}. {@code consultationMode} should match the slot row. */
public record BookAppointmentRequest(
        @NotNull @Positive Long slotId,
        String reason,
        /** {@code IN_CLINIC} or {@code VIDEO}; should match the slot visit type when supplied. */
        String consultationMode) {}
