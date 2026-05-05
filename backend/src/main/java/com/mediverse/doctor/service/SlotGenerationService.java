package com.mediverse.doctor.service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.mediverse.doctor.domain.DoctorAvailability;
import com.mediverse.doctor.domain.ScheduleDay;
import com.mediverse.doctor.domain.TimeSlot;
import com.mediverse.doctor.repository.DoctorAvailabilityRepository;
import com.mediverse.doctor.repository.TimeSlotRepository;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Builds concrete {@link TimeSlot}s for the next {@link #HORIZON_DAYS} calendar days from recurring
 * availability rules. Uses the JVM default time zone for interpreting "today" (align with local dev).
 */
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
            SlotKey key = new SlotKey(ts.getSlotDate(), ts.getStartTime());
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
                while (cursor.isBefore(windowEnd)) {
                    LocalTime slotEnd = cursor.plusMinutes(step);
                    if (slotEnd.isAfter(windowEnd)) {
                        break;
                    }
                    map.put(new SlotKey(date, cursor), rule.isRequiresApproval());
                    cursor = slotEnd;
                }
            }
        }
        return map;
    }

    /** Composite of columns covered by DB unique constraint {@code uq_doctor_slot}. */
    private record SlotKey(LocalDate slotDate, LocalTime startTime) {}

    private void materializeMissingSlots(Long doctorId, LocalDate startInclusive, LocalDate endInclusive) {
        Doctor doctor =
                doctorRepository.findById(doctorId).orElseThrow(() -> new IllegalStateException("doctor"));
        Collection<DoctorAvailability> rules =
                availabilityRepository.findByDoctor_IdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(
                        doctorId);

        List<TimeSlot> batch = new ArrayList<>();
        for (LocalDate date = startInclusive; !date.isAfter(endInclusive); date = date.plusDays(1)) {
            ScheduleDay day = ScheduleDay.from(date.getDayOfWeek());
            for (DoctorAvailability rule : rules) {
                if (rule.getDayOfWeek() != day || !rule.isActive()) {
                    continue;
                }
                int step = Math.max(10, rule.getSlotDurationMinutes());
                LocalTime windowEnd = rule.getEndTime();
                LocalTime cursor = rule.getStartTime();
                while (cursor.isBefore(windowEnd)) {
                    LocalTime slotEnd = cursor.plusMinutes(step);
                    if (slotEnd.isAfter(windowEnd)) {
                        break;
                    }
                    if (timeSlotRepository.existsByDoctor_IdAndSlotDateAndStartTime(
                            doctor.getId(), date, cursor)) {
                        cursor = slotEnd;
                        continue;
                    }
                    batch.add(
                            TimeSlot.builder()
                                    .doctor(doctor)
                                    .slotDate(date)
                                    .startTime(cursor)
                                    .endTime(slotEnd)
                                    .requiresApproval(rule.isRequiresApproval())
                                    .booked(false)
                                    .build());
                    cursor = slotEnd;
                }
            }
        }
        if (!batch.isEmpty()) {
            timeSlotRepository.saveAll(batch);
        }
    }
}
