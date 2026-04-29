package com.mediverse.doctor.repository;

import com.mediverse.doctor.domain.DoctorAvailability;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {

    Collection<DoctorAvailability> findByDoctorIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc(
            Long doctorId);

    Collection<DoctorAvailability> findByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(Long doctorId);

    void deleteByDoctor_Id(Long doctorId);
}
