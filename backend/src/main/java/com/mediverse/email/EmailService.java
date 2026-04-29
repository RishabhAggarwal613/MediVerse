package com.mediverse.email;

/**
 * Sends transactional emails (verify, reset, doctor approval, etc.).
 * Templates live under {@code classpath:/templates/email/}.
 *
 * <p>Implementations are {@code @Async} so callers don't block on SMTP I/O.
 */
public interface EmailService {

    void sendWelcome(String to, String fullName);

    void sendEmailVerification(String to, String fullName, String verifyLink);

    void sendPasswordReset(String to, String fullName, String resetLink);

    void sendDoctorVerificationPending(
            String adminEmail,
            String doctorName,
            String doctorEmail,
            String licenseUrl,
            String reviewLink);

    void sendDoctorVerified(String to, String fullName);

    void sendDoctorRejected(String to, String fullName, String reason);

    /** Appointment lifecycle emails sent synchronously (after commit), not {@code @Async}. */
    void sendAppointmentBookingPatient(
            String to, String patientName, String doctorName, String when, String intakeStatusPhrase);

    void sendAppointmentBookingDoctor(
            String to, String doctorName, String patientName, String when, String intakeStatusPhrase);

    void sendAppointmentApprovedPatient(String to, String patientName, String doctorName, String when);

    void sendAppointmentRejectedPatient(String to, String patientName, String doctorName, String when);

    void sendAppointmentCompletedPatient(
            String to, String patientName, String doctorName, String when, String doctorNoteSnippet);

    void sendAppointmentCancelledDoctor(String to, String doctorName, String patientName, String when);
}
