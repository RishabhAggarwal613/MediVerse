package com.mediverse.ai.repository;

import com.mediverse.ai.domain.AiReport;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AiReportRepository extends JpaRepository<AiReport, Long> {

    @Query(
            """
            SELECT DISTINCT r FROM AiReport r
            LEFT JOIN FETCH r.sharedWithDoctor d
            LEFT JOIN FETCH d.user
            JOIN FETCH r.patient p
            WHERE p.id = :patientId
            ORDER BY r.createdAt DESC
            """)
    List<AiReport> findForPatientFetched(@Param("patientId") Long patientId);

    @Query(
            """
            SELECT r FROM AiReport r
            LEFT JOIN FETCH r.sharedWithDoctor d
            LEFT JOIN FETCH d.user
            JOIN FETCH r.patient p JOIN FETCH p.user pu
            WHERE r.id = :id
            """)
    Optional<AiReport> findDetailById(@Param("id") Long id);
}
