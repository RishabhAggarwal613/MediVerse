package com.mediverse.doctor.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record TimeSlotItemDto(
        long id, LocalDate slotDate, LocalTime startTime, LocalTime endTime, boolean requiresApproval) {}
