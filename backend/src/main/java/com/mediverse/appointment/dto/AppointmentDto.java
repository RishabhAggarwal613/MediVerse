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
        /** {@code IN_CLINIC} or {@code VIDEO}. */
        String consultationMode,
        /** Populated after external scheduling hook (Calendly / Meet); often null today. */
        String meetJoinUrl,
        /**
         * Google Calendar event page when the API created an event; opens the visit in Calendar (web).
         */
        String googleCalendarHtmlLink,
        /** Doctor practice street — optional for navigation when in-clinic. */
        String practiceAddressFormatted,
        BigDecimal practiceLatitude,
        BigDecimal practiceLongitude) {}
