package com.mediverse.user.repository;

import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.VerificationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    @Query(
            value =
                    """
                    SELECT DISTINCT d FROM Doctor d JOIN FETCH d.user u WHERE d.verified = true
                     AND d.verificationStatus = :approved
                     AND (COALESCE(:q, '') = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR LOWER(COALESCE(d.specialization, '')) LIKE LOWER(CONCAT('%', :q, '%')))
                     AND (COALESCE(:spec, '') = '' OR LOWER(TRIM(d.specialization)) = LOWER(TRIM(:spec)))
                    """,
            countQuery =
                    """
                    SELECT COUNT(DISTINCT d.id) FROM Doctor d JOIN d.user u WHERE d.verified = true
                     AND d.verificationStatus = :approved
                     AND (COALESCE(:q, '') = '' OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR LOWER(COALESCE(d.specialization, '')) LIKE LOWER(CONCAT('%', :q, '%')))
                     AND (COALESCE(:spec, '') = '' OR LOWER(TRIM(d.specialization)) = LOWER(TRIM(:spec)))
                    """)
    Page<Doctor> searchVisible(
            @Param("q") String q,
            @Param("spec") String spec,
            @Param("approved") VerificationStatus approved,
            Pageable pageable);

    Optional<Doctor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    boolean existsByLicenseNumberIgnoreCase(String licenseNumber);

    Page<Doctor> findByVerificationStatus(VerificationStatus status, Pageable pageable);

    List<Doctor> findByVerificationStatus(VerificationStatus status);
}
