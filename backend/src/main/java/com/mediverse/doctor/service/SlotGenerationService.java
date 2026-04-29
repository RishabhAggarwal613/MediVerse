package com.mediverse.doctor.service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
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

    @Transactional
    public void regenerateSlotsForDoctor(Long doctorId) {
        LocalDate today = LocalDate.now(clock);
        LocalDate endInclusive = today.plusDays(HORIZON_DAYS - 1);
        timeSlotRepository.deleteUnbookedBetween(doctorId, today, endInclusive);

        Doctor doctor =
                doctorRepository.findById(doctorId).orElseThrow(() -> new IllegalStateException("doctor"));
        Collection<DoctorAvailability> rules =
                availabilityRepository.findByDoctor_IdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(
                        doctorId);

        List<TimeSlot> batch = new ArrayList<>();
        for (LocalDate date = today; !date.isAfter(endInclusive); date = date.plusDays(1)) {
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
