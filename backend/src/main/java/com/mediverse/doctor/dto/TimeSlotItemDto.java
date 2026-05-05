package com.mediverse.doctor.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record TimeSlotItemDto(
        long id,
        LocalDate slotDate,
        LocalTime startTime,
        LocalTime endTime,
        boolean requiresApproval,
        /** {@code IN_CLINIC} or {@code VIDEO}. */
        String consultationMode) {}
