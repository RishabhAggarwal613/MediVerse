package com.mediverse.appointment.repository;

import com.mediverse.appointment.domain.Appointment;
import com.mediverse.appointment.domain.AppointmentStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "timeSlot"})
    Optional<Appointment> findWithParticipantsById(Long id);

    boolean existsByPatient_IdAndDoctor_IdAndScheduledAtBetweenAndStatusIn(
            Long patientId,
            Long doctorId,
            LocalDateTime rangeStartInclusive,
            LocalDateTime rangeEndExclusive,
            Collection<AppointmentStatus> statuses);

    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "timeSlot"})
    List<Appointment> findByPatient_IdOrderByScheduledAtDesc(Long patientId);

    @EntityGraph(attributePaths = {"patient.user", "doctor.user", "timeSlot"})
    List<Appointment> findByDoctor_IdOrderByScheduledAtDesc(Long doctorId);

    @Query(
            """
            SELECT COUNT(DISTINCT a.patient.id) FROM Appointment a
            WHERE a.doctor.id = :doctorId AND a.status IN ('CONFIRMED','COMPLETED')
            """)
    long countDistinctPatientsServed(@Param("doctorId") Long doctorId);

    @Query(
            """
            SELECT COUNT(a) FROM Appointment a
            WHERE a.doctor.id = :doctorId
            AND a.scheduledAt >= :dayStart AND a.scheduledAt < :dayEnd
            AND a.status IN ('PENDING','CONFIRMED')
            """)
    long countDoctorAppointmentsOnDay(
            @Param("doctorId") Long doctorId,
            @Param("dayStart") LocalDateTime dayStart,
            @Param("dayEnd") LocalDateTime dayEnd);

    @Query(
            """
            SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId
            AND a.scheduledAt >= :rangeStart AND a.scheduledAt < :rangeEndExclusive
            AND a.status IN ('PENDING','CONFIRMED','COMPLETED')
            """)
    long countDoctorAppointmentsBetween(
            @Param("doctorId") Long doctorId,
            @Param("rangeStart") LocalDateTime rangeStart,
            @Param("rangeEndExclusive") LocalDateTime rangeEndExclusive);
}
