package com.mediverse.doctor.repository;

import com.mediverse.doctor.domain.TimeSlot;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findByDoctor_IdAndSlotDateAndBookedFalseOrderByStartTimeAsc(
            Long doctorId, LocalDate slotDate);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
            """
            DELETE FROM TimeSlot t WHERE t.doctor.id = :doctorId
            AND t.slotDate BETWEEN :start AND :endInclusive
            AND t.booked = false
            """)
    int deleteUnbookedBetween(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDate start,
            @Param("endInclusive") LocalDate endInclusive);
}
