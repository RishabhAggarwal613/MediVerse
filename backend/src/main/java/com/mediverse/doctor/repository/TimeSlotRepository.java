package com.mediverse.doctor.repository;

import com.mediverse.doctor.domain.ConsultationMode;
import com.mediverse.doctor.domain.TimeSlot;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    /**
     * Pessimistically locks every {@link TimeSlot} that shares this slot's calendar moment across
     * modalities, ordered by id (consistent locking order avoids deadlocks when two txs book sibling
     * rows).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(
            """
            SELECT t FROM TimeSlot t
            JOIN FETCH t.doctor d
            JOIN FETCH d.user du
            WHERE EXISTS (
              SELECT 1 FROM TimeSlot a
              WHERE a.id = :slotId
              AND a.doctor.id = t.doctor.id
              AND a.slotDate = t.slotDate
              AND a.startTime = t.startTime
            )
            ORDER BY t.id ASC
            """)
    List<TimeSlot> lockMomentPeersForSlot(@Param("slotId") Long slotId);

    List<TimeSlot> findByDoctor_IdAndSlotDateAndStartTimeOrderByIdAsc(Long doctorId, LocalDate slotDate, LocalTime startTime);

    List<TimeSlot> findByDoctor_IdAndSlotDateAndConsultationModeAndBookedFalseOrderByStartTimeAsc(
            Long doctorId, LocalDate slotDate, ConsultationMode consultationMode);

    List<TimeSlot> findByDoctor_IdAndSlotDateAndBookedFalseAndConsultationModeInOrderByStartTimeAsc(
            Long doctorId, LocalDate slotDate, Collection<ConsultationMode> consultationModes);

    List<TimeSlot> findByDoctor_IdAndSlotDateBetweenAndBookedFalseOrderBySlotDateAscStartTimeAsc(
            Long doctorId, LocalDate startInclusive, LocalDate endInclusive);

    boolean existsByDoctor_IdAndSlotDateAndStartTimeAndConsultationMode(
            Long doctorId, LocalDate slotDate, LocalTime startTime, ConsultationMode consultationMode);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
            """
            DELETE FROM TimeSlot t WHERE t.doctor.id = :doctorId
            AND t.slotDate BETWEEN :start AND :endInclusive
            AND t.booked = false
            AND NOT EXISTS (SELECT 1 FROM Appointment a WHERE a.timeSlot.id = t.id)
            """)
    int deleteUnbookedBetween(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDate start,
            @Param("endInclusive") LocalDate endInclusive);
}
