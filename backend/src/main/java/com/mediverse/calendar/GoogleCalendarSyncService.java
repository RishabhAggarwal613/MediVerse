package com.mediverse.calendar;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.ConferenceSolutionKey;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.services.calendar.model.EntryPoint;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.ServiceAccountCredentials;
import com.google.auth.oauth2.UserCredentials;
import com.mediverse.appointment.domain.Appointment;
import com.mediverse.doctor.domain.ConsultationMode;
import com.mediverse.doctor.domain.TimeSlot;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.Patient;
import com.mediverse.user.domain.User;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

/**
 * Creates Google Calendar events (with optional Google Meet) when credentials are configured.
 * Failures are logged and do not fail the appointment transaction.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleCalendarSyncService {

    private static final ZoneId ZONE = ZoneId.systemDefault();

    private final GoogleCalendarProperties properties;
    private final ResourceLoader resourceLoader;

    private volatile Calendar calendarClient;
    private volatile String effectiveCalendarId;

    public record CreatedEvent(String eventId, String calendarId, String meetJoinUrl, String htmlLink) {}

    @PostConstruct
    void init() {
        if (!properties.enabled()) {
            log.info("Google Calendar integration is disabled (mediverse.google-calendar.enabled=false).");
            return;
        }
        if (!properties.oauthConfigured() && !properties.serviceAccountConfigured()) {
            log.warn(
                    "Google Calendar enabled but no credentials: set service-account-json-path or OAuth refresh token env vars.");
            return;
        }
        try {
            HttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
            GoogleCredentials credentials = loadCredentials();
            HttpCredentialsAdapter requestInitializer = new HttpCredentialsAdapter(credentials);
            String appName =
                    properties.applicationName() == null || properties.applicationName().isBlank()
                            ? "MediVerse"
                            : properties.applicationName().trim();
            this.calendarClient =
                    new Calendar.Builder(transport, GsonFactory.getDefaultInstance(), requestInitializer)
                            .setApplicationName(appName)
                            .build();
            this.effectiveCalendarId = resolveCalendarId(credentials);
            log.info("Google Calendar API client ready (calendarId={}).", effectiveCalendarId);
        } catch (Exception e) {
            log.warn("Google Calendar client could not be initialized: {}", e.getMessage());
            this.calendarClient = null;
        }
    }

    private String resolveCalendarId(GoogleCredentials credentials) {
        if (properties.calendarId() != null && !properties.calendarId().isBlank()) {
            return properties.calendarId().trim();
        }
        if (properties.oauthConfigured() || delegationActive()) {
            return "primary";
        }
        if (credentials instanceof ServiceAccountCredentials sa) {
            return sa.getClientEmail();
        }
        return "primary";
    }

    private boolean delegationActive() {
        return properties.delegatedUser() != null && !properties.delegatedUser().isBlank();
    }

    private GoogleCredentials loadCredentials() throws IOException {
        if (properties.oauthConfigured()) {
            GoogleCredentials oauth =
                    UserCredentials.newBuilder()
                            .setClientId(properties.oauthClientId().trim())
                            .setClientSecret(properties.oauthClientSecret().trim())
                            .setRefreshToken(properties.oauthRefreshToken().trim())
                            .build();
            return oauth.createScoped(Collections.singleton(CalendarScopes.CALENDAR_EVENTS));
        }
        Resource resource = resourceLoader.getResource(properties.serviceAccountJsonPath().trim());
        if (!resource.exists()) {
            throw new IOException(
                    "Service account JSON not found at: " + properties.serviceAccountJsonPath());
        }
        try (var in = resource.getInputStream()) {
            GoogleCredentials credentials =
                    GoogleCredentials.fromStream(in)
                            .createScoped(Collections.singleton(CalendarScopes.CALENDAR_EVENTS));
            if (delegationActive()) {
                if (!(credentials instanceof ServiceAccountCredentials sa)) {
                    throw new IllegalStateException(
                            "delegated-user requires service account credentials, not OAuth user credentials.");
                }
                credentials = sa.createDelegated(properties.delegatedUser().trim());
            }
            return credentials;
        }
    }

    public boolean isUsable() {
        return calendarClient != null && effectiveCalendarId != null && !effectiveCalendarId.isBlank();
    }

    /**
     * Inserts an event into Google Calendar (Meet link only for {@link ConsultationMode#VIDEO}). Returns
     * empty if Calendar is unavailable or fails.
     */
    public Optional<CreatedEvent> createAppointmentEvent(Appointment appointment, TimeSlot slot) {
        Calendar client = calendarClient;
        String calId = effectiveCalendarId;
        if (!isUsable() || client == null || calId == null) {
            return Optional.empty();
        }
        try {
            Doctor doctor = appointment.getDoctor();
            Patient patient = appointment.getPatient();
            User du = doctor.getUser();
            User pu = patient.getUser();
            LocalDateTime startLdt =
                    LocalDateTime.of(slot.getSlotDate(), slot.getStartTime());
            LocalDateTime endLdt = LocalDateTime.of(slot.getSlotDate(), slot.getEndTime());

            Event event = new Event();
            boolean video = appointment.getConsultationMode() == ConsultationMode.VIDEO;
            event.setSummary("MediVerse — Dr. %s × %s".formatted(du.getFullName(), pu.getFullName()));
            event.setDescription(buildDescription(appointment, video));

            EventDateTime start = toEventDateTime(startLdt);
            EventDateTime end = toEventDateTime(endLdt);
            event.setStart(start);
            event.setEnd(end);

            if (video) {
                ConferenceData cd = new ConferenceData();
                CreateConferenceRequest create =
                        new CreateConferenceRequest()
                                .setRequestId("mediverse-" + appointment.getId() + "-" + UUID.randomUUID())
                                .setConferenceSolutionKey(
                                        new ConferenceSolutionKey().setType("hangoutsMeet"));
                cd.setCreateRequest(create);
                event.setConferenceData(cd);
                event.setLocation("Google Meet — link is added automatically");
            } else {
                event.setConferenceData(null);
                if (doctor.getPracticeAddressFormatted() != null && !doctor.getPracticeAddressFormatted().isBlank()) {
                    event.setLocation(doctor.getPracticeAddressFormatted().trim());
                }
            }

            List<EventAttendee> attendees = new ArrayList<>(2);
            attendees.add(new EventAttendee().setEmail(pu.getEmail()).setDisplayName(pu.getFullName()));
            attendees.add(new EventAttendee().setEmail(du.getEmail()).setDisplayName(du.getFullName()));
            event.setAttendees(attendees);

            var insert = client.events().insert(calId, event);
            insert.setConferenceDataVersion(video ? 1 : 0);
            insert.setSendUpdates("all");
            insert.setSendNotifications(true);

            Event created = insert.execute();
            String meet = video ? extractMeetLink(created) : null;
            String html = created.getHtmlLink();
            html = html != null && !html.isBlank() ? html.trim() : null;

            CreatedEvent payload =
                    new CreatedEvent(
                            created.getId(),
                            calId,
                            meet,
                            html);
            log.info(
                    "Created Google Calendar event id={} for appointment {}; meetLinksPresent={}",
                    created.getId(),
                    appointment.getId(),
                    meet != null);
            return Optional.of(payload);
        } catch (Exception ex) {
            log.warn(
                    "Google Calendar event insert failed for appointment {}: {}",
                    appointment.getId(),
                    ex.getMessage());
            return Optional.empty();
        }
    }

    /** Removes the event when a booking is rejected or cancelled. */
    public void deleteEventSilently(Appointment appointment) {
        if (!isUsable()
                || appointment.getGoogleCalendarEventId() == null
                || appointment.getGoogleCalendarEventId().isBlank()) {
            return;
        }
        String cal =
                appointment.getGoogleCalendarCalendarId() != null
                                && !appointment.getGoogleCalendarCalendarId().isBlank()
                        ? appointment.getGoogleCalendarCalendarId()
                        : effectiveCalendarId;
        if (cal == null || cal.isBlank()) {
            return;
        }
        try {
            calendarClient.events().delete(cal, appointment.getGoogleCalendarEventId()).execute();
            log.info(
                    "Deleted Google Calendar event {} from calendar {} for appointment {}",
                    appointment.getGoogleCalendarEventId(),
                    cal,
                    appointment.getId());
        } catch (Exception ex) {
            log.warn(
                    "Could not delete Google Calendar event {}: {}",
                    appointment.getGoogleCalendarEventId(),
                    ex.getMessage());
        }
    }

    private static EventDateTime toEventDateTime(LocalDateTime local) {
        var zdt = local.atZone(ZONE);
        return new EventDateTime()
                .setDateTime(new DateTime(zdt.toInstant().toEpochMilli()))
                .setTimeZone(ZONE.getId());
    }

    private static String buildDescription(Appointment appointment, boolean video) {
        StringBuilder sb = new StringBuilder();
        sb.append("Appointment #").append(appointment.getId()).append(" booked via MediVerse.\n");
        if (appointment.getReason() != null && !appointment.getReason().isBlank()) {
            sb.append("Patient reason: ").append(appointment.getReason().trim()).append("\n");
        }
        if (video) {
            sb.append("Mode: Video (Google Meet).\n");
        } else {
            sb.append("Mode: In-clinic.\n");
        }
        return sb.toString().trim();
    }

    static String extractMeetLink(Event created) {
        if (created.getHangoutLink() != null && !created.getHangoutLink().isBlank()) {
            return created.getHangoutLink().trim();
        }
        ConferenceData cd = created.getConferenceData();
        if (cd == null || cd.getEntryPoints() == null) {
            return null;
        }
        List<EntryPoint> points = cd.getEntryPoints();
        String videoUri =
                points.stream()
                        .filter(e -> "video".equalsIgnoreCase(e.getEntryPointType()))
                        .map(EntryPoint::getUri)
                        .findFirst()
                        .orElse(null);
        if (videoUri != null && !videoUri.isBlank()) {
            return videoUri.trim();
        }
        return points.stream()
                .filter(e -> e.getUri() != null && !e.getUri().isBlank())
                .findFirst()
                .map(ep -> ep.getUri().trim())
                .orElse(null);
    }
}
