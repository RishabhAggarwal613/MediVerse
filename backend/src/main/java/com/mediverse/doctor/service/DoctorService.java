package com.mediverse.doctor.service;

import com.mediverse.auth.dto.UserDto;
import com.mediverse.common.api.ApiException;
import com.mediverse.doctor.domain.DoctorAvailability;
import com.mediverse.doctor.domain.ScheduleDay;
import com.mediverse.doctor.domain.ConsultationMode;
import com.mediverse.doctor.domain.TimeSlot;
import com.mediverse.doctor.dto.DoctorAvailabilityRuleDto;
import com.mediverse.doctor.dto.DoctorDashboardStatsDto;
import com.mediverse.doctor.dto.DoctorPublicDto;
import com.mediverse.doctor.dto.DoctorSummaryDto;
import com.mediverse.doctor.dto.MedicalSpecialization;
import com.mediverse.doctor.dto.PageResponse;
import com.mediverse.doctor.dto.SpecializationOptionDto;
import com.mediverse.doctor.dto.TimeSlotItemDto;
import com.mediverse.doctor.dto.UpdateDoctorProfileRequest;
import com.mediverse.doctor.dto.UpsertAvailabilityRequest;
import com.mediverse.doctor.repository.DoctorAvailabilityRepository;
import com.mediverse.doctor.repository.TimeSlotRepository;
import com.mediverse.appointment.service.AppointmentService;
import com.mediverse.common.security.AdminAllowlist;
import com.mediverse.storage.StorageService;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import com.mediverse.user.domain.VerificationStatus;
import com.mediverse.user.repository.DoctorRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final SlotGenerationService slotGenerationService;
    private final StorageService storageService;
    private final AppointmentService appointmentService;
    private final AdminAllowlist adminAllowlist;

    public List<SpecializationOptionDto> listSpecializationOptions() {
        return Arrays.stream(MedicalSpecialization.values())
                .map(e -> new SpecializationOptionDto(e.code(), e.label()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<DoctorSummaryDto> searchDoctors(String q, String specialization, int page, int size) {
        Page<Doctor> p =
                doctorRepository.searchVisible(
                        blankToNull(q),
                        blankToNull(specialization),
                        VerificationStatus.APPROVED,
                        PageRequest.of(
                                page,
                                Math.min(Math.max(size, 1), 50),
                                Sort.by(Sort.Direction.ASC, "id")));

        List<Doctor> docs = p.getContent();
        Map<Long, List<DoctorAvailability>> byDoctor = Collections.emptyMap();
        if (!docs.isEmpty()) {
            List<Long> ids =
                    docs.stream().map(Doctor::getId).toList();
            List<DoctorAvailability> batch = availabilityRepository.findActiveFetchedByDoctorIdIn(ids);
            byDoctor = batch.stream().collect(Collectors.groupingBy(da -> da.getDoctor().getId()));
        }

        Map<Long, List<DoctorAvailability>> rulesByDoctorId = byDoctor;
        List<DoctorSummaryDto> summaries = new ArrayList<>();
        for (Doctor doc : docs) {
            summaries.add(toSummary(doc, rulesByDoctorId.getOrDefault(doc.getId(), List.of())));
        }

        return new PageResponse<>(
                summaries,
                p.getNumber(),
                p.getSize(),
                p.getTotalElements(),
                p.getTotalPages(),
                p.isLast());
    }

    @Transactional(readOnly = true)
    public DoctorPublicDto getDoctorPublic(Long doctorId) {
        Doctor d = doctorRepository.findById(doctorId).orElseThrow(() -> ApiException.notFound("Doctor not found"));
        if (!(d.isVerified() && d.getVerificationStatus() == VerificationStatus.APPROVED)) {
            throw ApiException.notFound("Doctor not found");
        }
        return toPublicDto(d);
    }

    @Transactional(readOnly = true)
    public DoctorPublicDto getMyDoctorProfile(User user) {
        Doctor d = doctorFor(user);
        return toPublicDto(d);
    }

    @Transactional
    public DoctorPublicDto updateMyDoctorProfile(User user, UpdateDoctorProfileRequest req) {
        Doctor d = doctorFor(user);

        if (req.specialization() != null) {
            String spec = req.specialization().trim();
            d.setSpecialization(spec.isBlank() ? null : spec);
        }
        if (req.qualifications() != null) {
            String qual = req.qualifications().trim();
            d.setQualifications(qual.isBlank() ? null : qual);
        }
        if (req.yearsExperience() != null) {
            d.setYearsExperience(req.yearsExperience());
        }
        if (req.consultationFee() != null) {
            d.setConsultationFee(req.consultationFee());
        }
        if (req.bio() != null) {
            String bio = req.bio().trim();
            d.setBio(bio.isBlank() ? null : bio);
        }
        if (req.practiceCity() != null) {
            String pc = req.practiceCity().trim();
            d.setPracticeCity(pc.isBlank() ? null : pc);
        }
        if (req.languages() != null) {
            String langs = req.languages().trim();
            d.setLanguages(langs.isBlank() ? null : langs);
        }

        applyPracticeLocation(d, req);
        applyConsultationOfferToggles(d, req);

        doctorRepository.save(d);
        return toPublicDto(d);
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityRuleDto> listAvailabilityForOwner(User user) {
        Doctor d = doctorFor(user);
        return availabilityRepository.findByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(d.getId()).stream()
                .map(this::toRuleDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityRuleDto> listAvailabilityPublic(Long doctorId) {
        Doctor subject =
                doctorRepository.findById(doctorId).orElseThrow(() -> ApiException.notFound("Doctor not found"));
        if (!(subject.isVerified() && subject.getVerificationStatus() == VerificationStatus.APPROVED)) {
            throw ApiException.notFound("Doctor not found");
        }
        return availabilityRepository.findByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(doctorId).stream()
                .filter(DoctorAvailability::isActive)
                .map(this::toRuleDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorAvailabilityRuleDto addAvailabilityRule(User user, UpsertAvailabilityRequest req) {
        Doctor d = doctorFor(user);
        assertDoctorAllowsMode(d, req.consultationMode());
        validateWindow(req.startTime(), req.endTime());
        deactivateOverlappingSameModeRules(
                d.getId(), req.dayOfWeek(), req.consultationMode(), req.startTime(), req.endTime(), null);

        DoctorAvailability saved =
                availabilityRepository.save(
                        DoctorAvailability.builder()
                                .doctor(d)
                                .consultationMode(req.consultationMode())
                                .dayOfWeek(req.dayOfWeek())
                                .startTime(req.startTime())
                                .endTime(req.endTime())
                                .slotDurationMinutes(req.slotDurationMinutes())
                                .requiresApproval(req.requiresApproval())
                                .active(true)
                                .build());
        availabilityRepository.flush();

        slotGenerationService.regenerateSlotsForDoctor(d.getId());
        return toRuleDto(saved);
    }

    @Transactional
    public DoctorAvailabilityRuleDto updateAvailabilityRule(User user, long ruleId, UpsertAvailabilityRequest req) {
        Doctor d = doctorFor(user);
        DoctorAvailability rule =
                availabilityRepository
                        .findById(ruleId)
                        .filter(r -> r.getDoctor().getId().equals(d.getId()))
                        .orElseThrow(() -> ApiException.notFound("Availability rule not found"));

        assertDoctorAllowsMode(d, req.consultationMode());
        validateWindow(req.startTime(), req.endTime());
        deactivateOverlappingSameModeRules(
                d.getId(), req.dayOfWeek(), req.consultationMode(), req.startTime(), req.endTime(), ruleId);

        rule.setConsultationMode(req.consultationMode());
        rule.setDayOfWeek(req.dayOfWeek());
        rule.setStartTime(req.startTime());
        rule.setEndTime(req.endTime());
        rule.setSlotDurationMinutes(req.slotDurationMinutes());
        rule.setRequiresApproval(req.requiresApproval());

        availabilityRepository.save(rule);
        availabilityRepository.flush();
        slotGenerationService.regenerateSlotsForDoctor(d.getId());
        return toRuleDto(rule);
    }

    @Transactional
    public void deleteAvailabilityRule(User user, long ruleId) {
        Doctor d = doctorFor(user);
        DoctorAvailability rule =
                availabilityRepository
                        .findById(ruleId)
                        .filter(r -> r.getDoctor().getId().equals(d.getId()))
                        .orElseThrow(() -> ApiException.notFound("Availability rule not found"));

        Long doctorId = d.getId();
        availabilityRepository.delete(rule);
        // Regenerate runs after commit so a slot-regeneration failure cannot roll back the delete.
        scheduleRegenerateSlotsAfterCommit(doctorId);
    }

    private void scheduleRegenerateSlotsAfterCommit(Long doctorId) {
        Runnable regen =
                () -> {
                    try {
                        slotGenerationService.regenerateSlotsForDoctor(doctorId);
                    } catch (Exception ex) {
                        log.warn("Slot regeneration failed after availability delete for doctor {}", doctorId, ex);
                    }
                };
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            regen.run();
                        }
                    });
        } else {
            regen.run();
        }
    }

    /**
     * Ensures the rolling window has materialized slots (insert-only) then returns free slots for the
     * requested day. Uses {@link SlotGenerationService#ensureSlotsForRollingWindow} so listing does not
     * delete/recreate rows — stable {@link TimeSlot} ids are required for {@code POST /appointments}.
     */
    @Transactional
    public List<TimeSlotItemDto> listFreeSlots(Long doctorId, LocalDate date, ConsultationMode consultationMode) {
        Doctor d = doctorRepository.findById(doctorId).orElseThrow(() -> ApiException.notFound("Doctor not found"));
        if (!(d.isVerified() && d.getVerificationStatus() == VerificationStatus.APPROVED)) {
            throw ApiException.notFound("Doctor not found");
        }

        assertDoctorAllowsMode(d, consultationMode);

        slotGenerationService.ensureSlotsForRollingWindow(doctorId);

        List<TimeSlot> slots =
                timeSlotRepository.findByDoctor_IdAndSlotDateAndBookedFalseAndConsultationModeInOrderByStartTimeAsc(
                        doctorId, date, List.of(consultationMode));
        return slots.stream().map(this::toSlotDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorDashboardStatsDto dashboardStats(User user) {
        Doctor d = doctorFor(user);
        var counts = appointmentService.dashboardCounts(d.getId(), LocalDate.now());
        return new DoctorDashboardStatsDto(
                counts.appointmentsToday(), counts.weekRolling(), counts.totalPatientsBooked());
    }

    private Doctor doctorFor(User user) {
        if (user.getRole() != Role.DOCTOR) {
            throw ApiException.forbidden("Doctor account required");
        }
        return doctorRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> ApiException.notFound("Doctor profile not found"));
    }

    private DoctorAvailabilityRuleDto toRuleDto(DoctorAvailability rule) {
        return new DoctorAvailabilityRuleDto(
                rule.getId(),
                rule.getDayOfWeek(),
                rule.getConsultationMode(),
                rule.getStartTime(),
                rule.getEndTime(),
                rule.getSlotDurationMinutes(),
                rule.isRequiresApproval(),
                rule.isActive());
    }

    private TimeSlotItemDto toSlotDto(TimeSlot slot) {
        return new TimeSlotItemDto(
                slot.getId(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.isRequiresApproval(),
                slot.getConsultationMode().name());
    }

    private DoctorSummaryDto toSummary(Doctor doctor, List<DoctorAvailability> activeRulesForDoctor) {
        User u = doctor.getUser();
        String picUrl =
                u.getProfilePicUrl() == null || u.getProfilePicUrl().isBlank()
                        ? null
                        : storageService.urlFor(u.getProfilePicUrl());
        return new DoctorSummaryDto(
                doctor.getId(),
                u.getFullName(),
                doctor.getSpecialization(),
                doctor.getConsultationFee(),
                picUrl,
                formatWeeklyAvailabilitySummary(activeRulesForDoctor));
    }

    /** Human-readable condensed availability for browse cards (distinct from persisted slot instances). */
    private static String formatWeeklyAvailabilitySummary(List<DoctorAvailability> rules) {
        if (rules == null || rules.isEmpty()) {
            return "Weekly schedule not configured";
        }
        DateTimeFormatter clock = DateTimeFormatter.ofPattern("HH:mm");
        StringBuilder sb = new StringBuilder();
        for (DoctorAvailability r : rules) {
            if (sb.length() > 0) {
                sb.append(" · ");
            }
            String day =
                    r.getDayOfWeek().toDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                            + '('
                            + availabilityModeAbbrev(r.getConsultationMode())
                            + ')';
            sb.append(day)
                    .append(' ')
                    .append(clock.format(r.getStartTime()))
                    .append('–')
                    .append(clock.format(r.getEndTime()));
        }
        String out = sb.toString();
        if (out.length() > 200) {
            return out.substring(0, Math.min(out.length(), 197)) + "...";
        }
        return out;
    }

    private DoctorPublicDto toPublicDto(Doctor d) {
        User u = d.getUser();
        String phone = u.getPhone();
        UserDto usr = UserDto.from(u, storageService, null, adminAllowlist.contains(u.getEmail()));
        return new DoctorPublicDto(
                d.getId(),
                usr,
                phone,
                d.getSpecialization(),
                d.getQualifications(),
                d.getYearsExperience(),
                d.getConsultationFee(),
                d.getBio(),
                d.getPracticeCity(),
                d.getPracticeAddressFormatted(),
                d.getPracticeLatitude(),
                d.getPracticeLongitude(),
                d.getPracticePlaceId(),
                d.getLanguages(),
                d.getVerificationStatus(),
                d.isVerified(),
                d.isOffersInClinic(),
                d.isOffersVideo());
    }

    private static void assertDoctorAllowsMode(Doctor d, ConsultationMode mode) {
        if (mode == ConsultationMode.IN_CLINIC && !d.isOffersInClinic()) {
            throw ApiException.badRequest("This doctor is not accepting in-clinic visits");
        }
        if (mode == ConsultationMode.VIDEO && !d.isOffersVideo()) {
            throw ApiException.badRequest("This doctor is not accepting video consultations");
        }
    }

    private void applyConsultationOfferToggles(Doctor d, UpdateDoctorProfileRequest req) {
        boolean regen = false;
        if (Boolean.FALSE.equals(req.offersVideo())) {
            deactivateRulesForMode(d.getId(), ConsultationMode.VIDEO);
            regen = true;
        }
        if (Boolean.FALSE.equals(req.offersInClinic())) {
            deactivateRulesForMode(d.getId(), ConsultationMode.IN_CLINIC);
            regen = true;
        }
        if (req.offersInClinic() != null) {
            d.setOffersInClinic(req.offersInClinic());
        }
        if (req.offersVideo() != null) {
            d.setOffersVideo(req.offersVideo());
        }
        if (!d.isOffersInClinic() && !d.isOffersVideo()) {
            throw ApiException.badRequest("At least one of in-clinic or video must be enabled");
        }
        if (regen) {
            doctorRepository.flush();
            slotGenerationService.regenerateSlotsForDoctor(d.getId());
        }
    }

    private void deactivateRulesForMode(long doctorId, ConsultationMode mode) {
        List<DoctorAvailability> rules = availabilityRepository.findByDoctor_IdAndConsultationMode(doctorId, mode);
        if (rules.isEmpty()) {
            return;
        }
        for (DoctorAvailability r : rules) {
            r.setActive(false);
        }
        availabilityRepository.saveAll(rules);
    }

    private static void applyPracticeLocation(Doctor d, UpdateDoctorProfileRequest req) {
        if (!Boolean.TRUE.equals(req.replacePracticeLocation())) {
            return;
        }
        boolean hasLat = req.practiceLatitude() != null;
        boolean hasLng = req.practiceLongitude() != null;
        if (hasLat != hasLng) {
            throw ApiException.badRequest("practiceLatitude and practiceLongitude must both be provided together");
        }
        if (req.practiceAddressFormatted() != null) {
            String raw = req.practiceAddressFormatted().trim();
            d.setPracticeAddressFormatted(raw.isEmpty() ? null : (raw.length() > 500 ? raw.substring(0, 500) : raw));
        } else {
            d.setPracticeAddressFormatted(null);
        }
        d.setPracticeLatitude(req.practiceLatitude());
        d.setPracticeLongitude(req.practiceLongitude());
        if (req.practicePlaceId() != null) {
            String pid = req.practicePlaceId().trim();
            d.setPracticePlaceId(pid.isEmpty() ? null : (pid.length() > 256 ? pid.substring(0, 256) : pid));
        } else {
            d.setPracticePlaceId(null);
        }
    }

    private static void validateWindow(LocalTime start, LocalTime end) {
        if (!start.isBefore(end)) {
            throw ApiException.badRequest("start_time must be before end_time");
        }
    }

    /**
     * Archives (deactivates) any active rule of the same visit type on the same weekday that overlaps the
     * window being saved, so doctors can replace hours without a 409. In-clinic and video rules may still
     * overlap in time (parallel capacity).
     */
    private void deactivateOverlappingSameModeRules(
            long doctorId,
            ScheduleDay day,
            ConsultationMode mode,
            LocalTime start,
            LocalTime end,
            Long excludeRuleId) {
        List<DoctorAvailability> victims =
                availabilityRepository.findByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(doctorId).stream()
                        .filter(r -> r.getDayOfWeek() == day && r.isActive())
                        .filter(r -> r.getConsultationMode() == mode)
                        .filter(r -> excludeRuleId == null || !excludeRuleId.equals(r.getId()))
                        .filter(r -> overlaps(start, end, r.getStartTime(), r.getEndTime()))
                        .toList();
        if (victims.isEmpty()) {
            return;
        }
        for (DoctorAvailability r : victims) {
            r.setActive(false);
        }
        availabilityRepository.saveAll(victims);
        availabilityRepository.flush();
    }

    private static boolean overlaps(LocalTime s1, LocalTime e1, LocalTime s2, LocalTime e2) {
        return s1.isBefore(e2) && s2.isBefore(e1);
    }

    private static String availabilityModeAbbrev(ConsultationMode m) {
        return switch (m) {
            case IN_CLINIC -> "CLINIC";
            case VIDEO -> "VIDEO";
        };
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }
}
