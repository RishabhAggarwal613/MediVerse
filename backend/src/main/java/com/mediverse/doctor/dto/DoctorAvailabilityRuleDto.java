package com.mediverse.doctor.dto;

import com.mediverse.doctor.domain.ScheduleDay;
import java.time.LocalTime;

public record DoctorAvailabilityRuleDto(
        long id,
        ScheduleDay dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        int slotDurationMinutes,
        boolean requiresApproval,
        boolean active) {}
