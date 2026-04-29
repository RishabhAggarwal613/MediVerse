package com.mediverse.email;

import com.mediverse.common.config.properties.AppProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final AppProperties appProperties;

    @Override
    @Async
    public void sendWelcome(String to, String fullName) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("fullName", fullName);
        send(to, "Welcome to MediVerse", "email/welcome", vars);
    }

    @Override
    @Async
    public void sendEmailVerification(String to, String fullName, String verifyLink) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("fullName", fullName);
        vars.put("verifyLink", verifyLink);
        send(to, "Verify your MediVerse email", "email/verify-email", vars);
    }

    @Override
    @Async
    public void sendPasswordReset(String to, String fullName, String resetLink) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("fullName", fullName);
        vars.put("resetLink", resetLink);
        send(to, "Reset your MediVerse password", "email/reset-password", vars);
    }

    @Override
    @Async
    public void sendDoctorVerificationPending(
            String adminEmail,
            String doctorName,
            String doctorEmail,
            String licenseUrl,
            String reviewLink) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("doctorName", doctorName);
        vars.put("doctorEmail", doctorEmail);
        vars.put("licenseUrl", licenseUrl);
        vars.put("reviewLink", reviewLink);
        send(adminEmail, "[MediVerse] New doctor pending verification: " + doctorName,
                "email/doctor-verification-pending", vars);
    }

    @Override
    @Async
    public void sendDoctorVerified(String to, String fullName) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("fullName", fullName);
        send(to, "Your MediVerse doctor account is verified", "email/doctor-verified", vars);
    }

    @Override
    @Async
    public void sendDoctorRejected(String to, String fullName, String reason) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("fullName", fullName);
        vars.put("reason", reason);
        send(to, "MediVerse doctor verification update", "email/doctor-rejected", vars);
    }

    @Override
    public void sendAppointmentBookingPatient(
            String to,
            String patientName,
            String doctorName,
            String when,
            String intakeStatusPhrase) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("title", "Booking received");
        vars.put(
                "line1",
                "Hi " + patientName + ", your booking with Dr. " + doctorName + " (" + when + "). Status: " + intakeStatusPhrase + ".");
        vars.put(
                "line2",
                intakeStatusPhrase.contains("PENDING")
                        ? "Your doctor will confirm this visit shortly."
                        : "Your slot is confirmed.");
        sendSync(to, "[MediVerse] Appointment booked", "email/appointment-notify", vars);
    }

    @Override
    public void sendAppointmentBookingDoctor(
            String to, String doctorName, String patientName, String when, String intakeStatusPhrase) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("title", "New booking");
        vars.put(
                "line1",
                "Hi Dr. "
                        + doctorName
                        + ", "
                        + patientName
                        + " booked an appointment on "
                        + when
                        + ". Intake: "
                        + intakeStatusPhrase
                        + ".");
        vars.put("line2", "Review pending requests in MediVerse.");
        sendSync(to, "[MediVerse] New patient booking", "email/appointment-notify", vars);
    }

    @Override
    public void sendAppointmentApprovedPatient(String to, String patientName, String doctorName, String when) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("title", "Appointment confirmed");
        vars.put(
                "line1",
                "Hi " + patientName + ", Dr. " + doctorName + " confirmed your visit on " + when + ".");
        vars.put("line2", null);
        sendSync(to, "[MediVerse] Appointment confirmed", "email/appointment-notify", vars);
    }

    @Override
    public void sendAppointmentRejectedPatient(String to, String patientName, String doctorName, String when) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("title", "Appointment update");
        vars.put(
                "line1",
                "Hi " + patientName + ", Dr. " + doctorName + " could not approve the request for " + when + ". Pick another slot anytime.");
        vars.put("line2", null);
        sendSync(to, "[MediVerse] Appointment not approved", "email/appointment-notify", vars);
    }

    @Override
    public void sendAppointmentCompletedPatient(
            String to, String patientName, String doctorName, String when, String doctorNoteSnippet) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("title", "Visit completed");
        vars.put(
                "line1",
                "Hi " + patientName + ", your appointment with Dr. " + doctorName + " on " + when + " is marked complete.");
        vars.put("line2", doctorNoteSnippet.isBlank() ? null : "Doctor note: " + doctorNoteSnippet);
        sendSync(to, "[MediVerse] Appointment completed", "email/appointment-notify", vars);
    }

    @Override
    public void sendAppointmentCancelledDoctor(String to, String doctorName, String patientName, String when) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("title", "Cancellation");
        vars.put(
                "line1",
                "Hi Dr. " + doctorName + ", " + patientName + " cancelled their appointment on " + when + ".");
        vars.put("line2", null);
        sendSync(to, "[MediVerse] Appointment cancelled", "email/appointment-notify", vars);
    }

    /** Synchronous send (no {@code @Async}). */
    private void sendSync(String to, String subject, String template, Map<String, Object> vars) {
        send(to, subject, template, vars);
    }

    private void send(String to, String subject, String template, Map<String, Object> vars) {
        try {
            Context ctx = new Context();
            ctx.setVariables(vars);
            String html = templateEngine.process(template, ctx);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());
            helper.setFrom(appProperties.mail().from());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Sent '{}' to {}", subject, to);
        } catch (MessagingException | MailException e) {
            log.warn("Failed to send '{}' to {}: {}", subject, to, e.getMessage());
        }
    }
}
