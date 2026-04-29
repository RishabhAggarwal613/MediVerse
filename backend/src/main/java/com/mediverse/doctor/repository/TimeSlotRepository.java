package com.mediverse.doctor.repository;

import com.mediverse.doctor.domain.TimeSlot;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(
            """
            SELECT t FROM TimeSlot t
            JOIN FETCH t.doctor d
            JOIN FETCH d.user du
            WHERE t.id = :id
            """)
    Optional<TimeSlot> findLockedById(@Param("id") Long id);

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
