package com.mediverse.doctor.service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import com.mediverse.doctor.domain.ConsultationMode;
import com.mediverse.doctor.domain.DoctorAvailability;
import com.mediverse.doctor.domain.ScheduleDay;
import com.mediverse.doctor.domain.TimeSlot;
import com.mediverse.doctor.repository.DoctorAvailabilityRepository;
import com.mediverse.doctor.repository.TimeSlotRepository;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Builds concrete {@link TimeSlot}s for the next {@link #HORIZON_DAYS} calendar days from recurring
 * availability rules. Uses the JVM default time zone for interpreting "today" (align with local dev).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SlotGenerationService {

    static final int HORIZON_DAYS = 14;

    private final TimeSlotRepository timeSlotRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;

    private final Clock clock = Clock.systemDefaultZone();

    /**
     * Full rebuild after availability edits: drop unbooked materialized slots, then refill from rules.
     * Do not call this on patient browse; it destroys stable slot row ids clients use to book.
     */
    @Transactional
    public void regenerateSlotsForDoctor(Long doctorId) {
        LocalDate today = LocalDate.now(clock);
        LocalDate endInclusive = today.plusDays(HORIZON_DAYS - 1);
        timeSlotRepository.deleteUnbookedBetween(doctorId, today, endInclusive);
        timeSlotRepository.flush();
        materializeMissingSlots(doctorId, today, endInclusive);
    }

    /**
     * Idempotent refill for the rolling window: inserts only missing slots. Safe to call from
     * patient-facing slot listings so {@link TimeSlot#getId()} stays stable until a slot is booked or a
     * doctor triggers {@link #regenerateSlotsForDoctor}.
     */
    @Transactional
    public void ensureSlotsForRollingWindow(Long doctorId) {
        LocalDate today = LocalDate.now(clock);
        LocalDate endInclusive = today.plusDays(HORIZON_DAYS - 1);
        materializeMissingSlots(doctorId, today, endInclusive);
        repairUnbookedApprovalFlags(doctorId, today, endInclusive);
    }

    /**
     * Keeps {@code requires_approval} on existing unbooked rows aligned with the doctor's current
     * rules. Without this, rows created when a rule was instant-book would still show as instant if
     * the doctor later enabled approval (insert-only materialization never updates them).
     */
    private void repairUnbookedApprovalFlags(Long doctorId, LocalDate startInclusive, LocalDate endInclusive) {
        Map<SlotKey, Boolean> expected = buildExpectedRequiresApprovalMap(doctorId, startInclusive, endInclusive);
        if (expected.isEmpty()) {
            return;
        }
        List<TimeSlot> unbooked =
                timeSlotRepository.findByDoctor_IdAndSlotDateBetweenAndBookedFalseOrderBySlotDateAscStartTimeAsc(
                        doctorId, startInclusive, endInclusive);
        List<TimeSlot> dirty = new ArrayList<>();
        for (TimeSlot ts : unbooked) {
            SlotKey key =
                    new SlotKey(ts.getSlotDate(), ts.getStartTime(), ts.getConsultationMode());
            Boolean exp = expected.get(key);
            if (exp != null && ts.isRequiresApproval() != exp) {
                ts.setRequiresApproval(exp);
                dirty.add(ts);
            }
        }
        if (!dirty.isEmpty()) {
            timeSlotRepository.saveAll(dirty);
        }
    }

    private Map<SlotKey, Boolean> buildExpectedRequiresApprovalMap(
            Long doctorId, LocalDate startInclusive, LocalDate endInclusive) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new IllegalStateException("doctor");
        }
        Collection<DoctorAvailability> rules =
                availabilityRepository.findByDoctor_IdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(
                        doctorId);

        Map<SlotKey, Boolean> map = new HashMap<>();
        for (LocalDate date = startInclusive; !date.isAfter(endInclusive); date = date.plusDays(1)) {
            ScheduleDay day = ScheduleDay.from(date.getDayOfWeek());
            for (DoctorAvailability rule : rules) {
                if (rule.getDayOfWeek() != day || !rule.isActive()) {
                    continue;
                }
                int step = Math.max(10, rule.getSlotDurationMinutes());
                LocalTime windowEnd = rule.getEndTime();
                LocalTime cursor = rule.getStartTime();
                ConsultationMode mode = rule.getConsultationMode();
                while (cursor.isBefore(windowEnd)) {
                    LocalTime slotEnd = cursor.plusMinutes(step);
                    if (slotEnd.isAfter(windowEnd)) {
                        break;
                    }
                    map.put(new SlotKey(date, cursor, mode), rule.isRequiresApproval());
                    cursor = slotEnd;
                }
            }
        }
        return map;
    }

    /** Mirrors DB unique constraint {@code uq_doctor_slot_mode}. */
    private record SlotKey(LocalDate slotDate, LocalTime startTime, ConsultationMode consultationMode) {}

    private void materializeMissingSlots(Long doctorId, LocalDate startInclusive, LocalDate endInclusive) {
        Doctor doctor =
                doctorRepository.findById(doctorId).orElseThrow(() -> new IllegalStateException("doctor"));
        Collection<DoctorAvailability> rules =
                availabilityRepository.findByDoctor_IdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(
                        doctorId);

        Set<SlotKey> queued = new HashSet<>();
        for (LocalDate date = startInclusive; !date.isAfter(endInclusive); date = date.plusDays(1)) {
            ScheduleDay day = ScheduleDay.from(date.getDayOfWeek());
            for (DoctorAvailability rule : rules) {
                if (rule.getDayOfWeek() != day || !rule.isActive()) {
                    continue;
                }
                int step = Math.max(10, rule.getSlotDurationMinutes());
                LocalTime windowEnd = rule.getEndTime();
                LocalTime cursor = rule.getStartTime();
                ConsultationMode mode = rule.getConsultationMode();
                while (cursor.isBefore(windowEnd)) {
                    LocalTime slotEnd = cursor.plusMinutes(step);
                    if (slotEnd.isAfter(windowEnd)) {
                        break;
                    }
                    if (timeSlotRepository.existsByDoctor_IdAndSlotDateAndStartTimeAndConsultationMode(
                            doctor.getId(), date, cursor, mode)) {
                        cursor = slotEnd;
                        continue;
                    }
                    SlotKey candidate = new SlotKey(date, cursor, mode);
                    if (!queued.add(candidate)) {
                        cursor = slotEnd;
                        continue;
                    }
                    TimeSlot built =
                            TimeSlot.builder()
                                    .doctor(doctor)
                                    .slotDate(date)
                                    .startTime(cursor)
                                    .endTime(slotEnd)
                                    .requiresApproval(rule.isRequiresApproval())
                                    .consultationMode(mode)
                                    .booked(false)
                                    .build();
                    try {
                        timeSlotRepository.saveAndFlush(built);
                    } catch (DataIntegrityViolationException ex) {
                        // Another rule or concurrent request inserted the same key; harmless.
                        log.debug(
                                "Skipped duplicate slot (doctor={} {} {} {}).",
                                doctor.getId(),
                                date,
                                cursor,
                                mode,
                                ex);
                    }
                    cursor = slotEnd;
                }
            }
        }
    }
}
