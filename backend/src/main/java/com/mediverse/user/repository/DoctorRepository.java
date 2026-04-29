package com.mediverse.user.repository;

import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.VerificationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByLicenseNumberIgnoreCase(String licenseNumber);

    Page<Doctor> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    List<Doctor> findByVerificationStatus(VerificationStatus status);
}
