package com.mediverse.appointment.service;

import com.mediverse.appointment.domain.Appointment;
import com.mediverse.appointment.domain.AppointmentStatus;
import com.mediverse.appointment.dto.AppointmentDto;
import com.mediverse.appointment.dto.BookAppointmentRequest;
import com.mediverse.appointment.dto.CompleteAppointmentRequest;
import com.mediverse.appointment.repository.AppointmentRepository;
import com.mediverse.common.api.ApiException;
import com.mediverse.common.config.properties.AppProperties;
import com.mediverse.doctor.domain.ConsultationMode;
import com.mediverse.doctor.domain.TimeSlot;
import com.mediverse.doctor.repository.TimeSlotRepository;
import com.mediverse.email.EmailService;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.Patient;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import com.mediverse.user.domain.VerificationStatus;
import com.mediverse.user.repository.DoctorRepository;
import com.mediverse.user.repository.PatientRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final ZoneId ZONE = ZoneId.systemDefault();

    /** Active bookings that occupy the patient's wall-clock instant with one doctor. */
    private static final Set<AppointmentStatus> DUPLICATE_GUARD_STATUSES =
            Set.copyOf(EnumSet.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED));

    private final AppointmentRepository appointmentRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppProperties appProperties;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<AppointmentDto> listMine(User user, String statusRaw) {
        AppointmentStatus filter = parseStatus(statusRaw);
        if (user.getRole() == Role.PATIENT) {
            Patient patient = patientOrThrow(user);
            return appointmentRepository.findByPatient_IdOrderByScheduledAtDesc(patient.getId()).stream()
                    .filter(a -> filter == null || a.getStatus() == filter)
                    .map(this::toDtoWithDetails)
                    .collect(Collectors.toList());
        }
        if (user.getRole() == Role.DOCTOR) {
            Doctor doctor = doctor(user);
            return appointmentRepository.findByDoctor_IdOrderByScheduledAtDesc(doctor.getId()).stream()
                    .filter(a -> filter == null || a.getStatus() == filter)
                    .map(this::toDtoWithDetails)
                    .collect(Collectors.toList());
        }
        throw ApiException.forbidden("Unsupported role");
    }

    @Transactional(readOnly = true)
    public AppointmentDto getByIdForUser(Long id, User user) {
        Appointment appointment =
                appointmentRepository.findWithParticipantsById(id).orElseThrow(() -> ApiException.notFound("Appointment not found"));
        assertParticipant(appointment, user);
        return toDtoWithDetails(appointment);
    }

    @Transactional
    public AppointmentDto book(User user, BookAppointmentRequest body) {
        if (user.getRole() != Role.PATIENT) {
            throw ApiException.forbidden("Only patients can book appointments");
        }
        Patient patient = patientOrThrow(user);

        List<TimeSlot> peers =
                timeSlotRepository.lockMomentPeersForSlot(body.slotId());
        if (peers.isEmpty()) {
            throw ApiException.notFound("Time slot not found");
        }

        TimeSlot slot =
                peers.stream()
                        .filter(t -> t.getId().equals(body.slotId()))
                        .findFirst()
                        .orElseThrow(() -> ApiException.badRequest("Time slot does not match the selected slot"));

        Doctor doctor = slot.getDoctor();
        assertPublishableDoctor(doctor);

        if (peers.stream().anyMatch(TimeSlot::isBooked)) {
            throw ApiException.conflict("This slot was just booked. Please pick another.");
        }

        LocalDate horizonEnd = LocalDate.now().plusDays(appProperties.appointment().bookingHorizonDays());
        if (slot.getSlotDate().isAfter(horizonEnd)) {
            throw ApiException.badRequest("That date is outside the booking window");
        }

        ConsultationMode bookedMode = resolveBookedConsultationMode(body, doctor, slot);

        LocalDateTime scheduledAt =
                LocalDateTime.of(slot.getSlotDate(), slot.getStartTime());
        Instant nowInst = Instant.now();
        LocalDateTime now = LocalDateTime.ofInstant(nowInst, ZONE);
        if (scheduledAt.isBefore(now)) {
            throw ApiException.badRequest("Cannot book a slot that has already started");
        }

        if (appointmentRepository.existsByPatient_IdAndDoctor_IdAndScheduledAtAndStatusIn(
                patient.getId(), doctor.getId(), scheduledAt, DUPLICATE_GUARD_STATUSES)) {
            throw ApiException.conflict("You already have a booking with this doctor at this time.");
        }

        AppointmentStatus initial =
                slot.isRequiresApproval() ? AppointmentStatus.PENDING : AppointmentStatus.CONFIRMED;

        String reasonTrimmed = body.reason() == null ? null : body.reason().trim();
        String reason = reasonTrimmed != null && !reasonTrimmed.isBlank() ? reasonTrimmed.substring(0, Math.min(reasonTrimmed.length(), 500)) : null;

        Appointment apt =
                Appointment.builder()
                        .patient(patient)
                        .doctor(doctor)
                        .timeSlot(slot)
                        .status(initial)
                        .reason(reason)
                        .consultationMode(bookedMode)
                        .scheduledAt(scheduledAt)
                        .build();

        Appointment saved = appointmentRepository.saveAndFlush(apt);
        peers.forEach(t -> t.setBooked(true));
        timeSlotRepository.saveAll(peers);

        User patientUserEntity = patient.getUser();
        User doctorUserEntity = doctor.getUser();
        String when = scheduledAt.format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy '·' HH:mm"));

        AppointmentDto dto = toDtoWithDetails(saved);
        Runnable notify =
                () -> {
                    emailService.sendAppointmentBookingPatient(
                            patientUserEntity.getEmail(), patientUserEntity.getFullName(), doctorUserEntity.getFullName(), when, initial.name());
                    emailService.sendAppointmentBookingDoctor(
                            doctorUserEntity.getEmail(),
                            doctorUserEntity.getFullName(),
                            patientUserEntity.getFullName(),
                            when,
                            initial.name());
                };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            notify.run();
                        }
                    });
        } else {
            notify.run();
        }
        return dto;
    }

    @Transactional
    public AppointmentDto approve(Long id, User user) {
        Doctor doctor = doctor(user);
        Appointment appointment = lockedAppointment(id);
        assertDoctor(appointment, doctor);
        assertStatus(appointment, AppointmentStatus.PENDING);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment saved = appointmentRepository.save(appointment);

        AppointmentDto dto = toDtoWithDetails(saved);
        User patientUser = appointment.getPatient().getUser();
        User doctorUser = doctor.getUser();
        Runnable send =
                () ->
                        emailService.sendAppointmentApprovedPatient(
                                patientUser.getEmail(),
                                patientUser.getFullName(),
                                doctorUser.getFullName(),
                                appointment.getScheduledAt()
                                        .format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy '·' HH:mm")));
        scheduleAfterCommit(send);
        return dto;
    }

    @Transactional
    public AppointmentDto reject(Long id, User user) {
        Doctor doctor = doctor(user);
        Appointment appointment = lockedAppointment(id);
        assertDoctor(appointment, doctor);
        assertStatus(appointment, AppointmentStatus.PENDING);
        appointment.setStatus(AppointmentStatus.REJECTED);
        releaseMomentSlots(appointment);
        Appointment saved = appointmentRepository.save(appointment);

        AppointmentDto dto = toDtoWithDetails(saved);
        User patientUser = appointment.getPatient().getUser();
        User doctorUser = doctor.getUser();
        Runnable send =
                () ->
                        emailService.sendAppointmentRejectedPatient(
                                patientUser.getEmail(),
                                patientUser.getFullName(),
                                doctorUser.getFullName(),
                                appointment.getScheduledAt()
                                        .format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy '·' HH:mm")));
        scheduleAfterCommit(send);
        return dto;
    }

    @Transactional
    public AppointmentDto complete(Long id, User user, CompleteAppointmentRequest req) {
        Doctor doctor = doctor(user);
        Appointment appointment = lockedAppointment(id);
        assertDoctor(appointment, doctor);
        assertStatus(appointment, AppointmentStatus.CONFIRMED);
        appointment.setStatus(AppointmentStatus.COMPLETED);
        String noteTrimmed = req == null || req.doctorNote() == null ? null : req.doctorNote().trim();
        appointment.setDoctorNote(noteTrimmed == null || noteTrimmed.isBlank() ? null : noteTrimmed);
        Appointment saved = appointmentRepository.save(appointment);

        AppointmentDto dto = toDtoWithDetails(saved);
        User patientUser = appointment.getPatient().getUser();
        User doctorUser = doctor.getUser();
        String noteFinal = appointment.getDoctorNote();
        Runnable send =
                () ->
                        emailService.sendAppointmentCompletedPatient(
                                patientUser.getEmail(),
                                patientUser.getFullName(),
                                doctorUser.getFullName(),
                                appointment.getScheduledAt()
                                        .format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy '·' HH:mm")),
                                noteFinal != null ? noteFinal : "");
        scheduleAfterCommit(send);
        return dto;
    }

    @Transactional
    public AppointmentDto cancel(Long id, User user) {
        if (user.getRole() != Role.PATIENT) {
            throw ApiException.forbidden("Only patients can cancel from this endpoint");
        }
        Patient patient = patientOrThrow(user);
        Appointment appointment = lockedAppointment(id);
        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw ApiException.forbidden("Not allowed to cancel this appointment");
        }
        if (appointment.getStatus() != AppointmentStatus.PENDING && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw ApiException.badRequest("This appointment cannot be cancelled");
        }
        LocalDateTime cutoff =
                appointment.getScheduledAt().minusHours(appProperties.appointment().cancelWindowHours());
        if (LocalDateTime.now(ZONE).isAfter(cutoff)) {
            throw ApiException.badRequest(
                    "Cancellations must be at least " + appProperties.appointment().cancelWindowHours()
                            + " hours before the appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        releaseMomentSlots(appointment);
        Appointment saved = appointmentRepository.save(appointment);

        AppointmentDto dto = toDtoWithDetails(saved);
        User doctorUser = appointment.getDoctor().getUser();
        Runnable send =
                () ->
                        emailService.sendAppointmentCancelledDoctor(
                                doctorUser.getEmail(),
                                doctorUser.getFullName(),
                                appointment.getPatient().getUser().getFullName(),
                                appointment.getScheduledAt()
                                        .format(DateTimeFormatter.ofPattern("EEE, d MMM yyyy '·' HH:mm")));
        scheduleAfterCommit(send);
        return dto;
    }

    private void scheduleAfterCommit(Runnable notify) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            notify.run();
                        }
                    });
        } else {
            notify.run();
        }
    }

    private Appointment lockedAppointment(Long id) {
        return appointmentRepository.findWithParticipantsById(id).orElseThrow(() -> ApiException.notFound("Appointment not found"));
    }

    private void assertParticipant(Appointment appointment, User user) {
        if (user.getRole() == Role.PATIENT) {
            Patient patient = patientOrThrow(user);
            if (!appointment.getPatient().getId().equals(patient.getId())) {
                throw ApiException.forbidden("Not allowed to view this appointment");
            }
        } else if (user.getRole() == Role.DOCTOR) {
            Doctor doctor = doctor(user);
            if (!appointment.getDoctor().getId().equals(doctor.getId())) {
                throw ApiException.forbidden("Not allowed to view this appointment");
            }
        } else {
            throw ApiException.forbidden("Unsupported role");
        }
    }

    private void assertDoctor(Appointment appointment, Doctor doctor) {
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            throw ApiException.forbidden("Not allowed to manage this appointment");
        }
    }

    private void assertStatus(Appointment appointment, AppointmentStatus expected) {
        if (appointment.getStatus() != expected) {
            throw ApiException.badRequest("Appointment is not in required status for this action");
        }
    }

    private void releaseMomentSlots(Appointment appointment) {
        TimeSlot ts = appointment.getTimeSlot();
        List<TimeSlot> momentPeers =
                timeSlotRepository.findByDoctor_IdAndSlotDateAndStartTimeOrderByIdAsc(
                        appointment.getDoctor().getId(), ts.getSlotDate(), ts.getStartTime());
        momentPeers.forEach(t -> t.setBooked(false));
        timeSlotRepository.saveAll(momentPeers);
    }

    /**
     * Exposed for DoctorService dashboard aggregates (same transactional boundaries as appointment
     * module).
     */
    @Transactional(readOnly = true)
    public DashboardCounts dashboardCounts(Long doctorRowId, LocalDate today) {
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEndExclusive = today.plusDays(1).atStartOfDay();
        long todayCount =
                appointmentRepository.countDoctorAppointmentsOnDay(doctorRowId, dayStart, dayEndExclusive);

        LocalDateTime weekEndExclusive =
                today.plusDays((long) appProperties.appointment().bookingHorizonDays() + 1).atStartOfDay();
        long weekRolling =
                appointmentRepository.countDoctorAppointmentsBetween(doctorRowId, dayStart, weekEndExclusive);

        long distinct = appointmentRepository.countDistinctPatientsServed(doctorRowId);
        return new DashboardCounts(todayCount, weekRolling, distinct);
    }

    public record DashboardCounts(long appointmentsToday, long weekRolling, long totalPatientsBooked) {}

    private AppointmentDto toDtoWithDetails(Appointment appointment) {
        Patient patient = appointment.getPatient();
        Doctor doctor = appointment.getDoctor();
        User pu = patient.getUser();
        User du = doctor.getUser();
        return new AppointmentDto(
                appointment.getId(),
                appointment.getStatus().name(),
                appointment.getScheduledAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                appointment.getTimeSlot().getId(),
                doctor.getId(),
                patient.getId(),
                pu.getFullName(),
                du.getFullName(),
                pu.getEmail(),
                du.getEmail(),
                appointment.getReason(),
                appointment.getDoctorNote(),
                appointment.getConsultationMode().name(),
                appointment.getMeetJoinUrl(),
                doctor.getPracticeAddressFormatted(),
                doctor.getPracticeLatitude(),
                doctor.getPracticeLongitude());
    }

    /** Resolves persisted appointment modality — must align with slot row mode and doctor offers. */
    private static ConsultationMode resolveBookedConsultationMode(
            BookAppointmentRequest body, Doctor doctor, TimeSlot slot) {
        ConsultationMode fixed = slot.getConsultationMode();
        assertDoctorOffersMode(doctor, fixed);
        if (body.consultationMode() != null && !body.consultationMode().isBlank()) {
            ConsultationMode sent;
            try {
                sent = ConsultationMode.valueOf(body.consultationMode().trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw ApiException.badRequest("Invalid consultationMode (use IN_CLINIC or VIDEO)");
            }
            if (sent != fixed) {
                throw ApiException.badRequest("Slot does not match the selected consultation mode");
            }
        }
        return fixed;
    }

    private static void assertDoctorOffersMode(Doctor doctor, ConsultationMode mode) {
        if (mode == ConsultationMode.IN_CLINIC && !doctor.isOffersInClinic()) {
            throw ApiException.badRequest("This doctor is not accepting in-clinic visits");
        }
        if (mode == ConsultationMode.VIDEO && !doctor.isOffersVideo()) {
            throw ApiException.badRequest("This doctor is not accepting video consultations");
        }
    }

    private Patient patientOrThrow(User user) {
        return patientRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> ApiException.forbidden("Patient profile required"));
    }

    private Doctor doctor(User user) {
        if (user.getRole() != Role.DOCTOR) {
            throw ApiException.forbidden("Doctor account required");
        }
        return doctorRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> ApiException.notFound("Doctor profile not found"));
    }

    private static void assertPublishableDoctor(Doctor doctor) {
        if (!doctor.isVerified() || doctor.getVerificationStatus() != VerificationStatus.APPROVED) {
            throw ApiException.notFound("Doctor not found");
        }
    }

    private static AppointmentStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return AppointmentStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest("Invalid status filter");
        }
    }
}
