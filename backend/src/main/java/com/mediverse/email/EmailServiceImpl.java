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
