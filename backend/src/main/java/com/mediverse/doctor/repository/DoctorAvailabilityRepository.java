package com.mediverse.doctor.repository;

import com.mediverse.doctor.domain.DoctorAvailability;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    Collection<DoctorAvailability> findByDoctor_IdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(
            Long doctorId);

    Collection<DoctorAvailability> findByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(Long doctorId);

    @Query(
            """
            SELECT da FROM DoctorAvailability da JOIN FETCH da.doctor d
            WHERE d.id IN :ids AND da.active = true
            ORDER BY d.id, da.dayOfWeek, da.startTime
            """)
    List<DoctorAvailability> findActiveFetchedByDoctorIdIn(@Param("ids") Collection<Long> ids);

    void deleteByDoctor_Id(Long doctorId);
}
