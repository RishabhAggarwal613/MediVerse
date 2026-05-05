package com.mediverse.appointment.dto;

import java.math.BigDecimal;

public record AppointmentDto(
        Long id,
        String status,
        String scheduledAt,
        Long timeSlotId,
        Long doctorId,
        Long patientId,
        String patientName,
        String doctorName,
        String patientEmail,
        String doctorEmail,
        String reason,
        String doctorNote,
        /** Doctor practice street / clinic address for patient navigation — optional. */
        String practiceAddressFormatted,
        BigDecimal practiceLatitude,
        BigDecimal practiceLongitude) {}
