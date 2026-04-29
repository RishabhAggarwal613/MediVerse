package com.mediverse.doctor.dto;

import com.mediverse.doctor.domain.ScheduleDay;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record UpsertAvailabilityRequest(
        @NotNull ScheduleDay dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @Min(10) @Max(240) int slotDurationMinutes,
        boolean requiresApproval) {}
