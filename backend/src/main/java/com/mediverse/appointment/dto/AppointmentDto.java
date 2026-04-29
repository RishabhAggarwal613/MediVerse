package com.mediverse.appointment.dto;

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
        String doctorNote) {}
