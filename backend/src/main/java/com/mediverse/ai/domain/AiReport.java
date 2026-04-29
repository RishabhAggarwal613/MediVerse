package com.mediverse.ai.domain;

import com.fasterxml.jackson.databind.JsonNode;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.Patient;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "ai_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    /** Storage key ({@link com.mediverse.storage.StorageService}); not a public HTTP URL alone. */
    @Column(name = "file_url", nullable = false, length = 500)
    private String fileUrl;

    @Column(name = "content_type", nullable = false, length = 80)
    private String contentType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "key_findings", nullable = false)
    private List<AiReportFindingSnapshot> keyFindings = new ArrayList<>();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String recommendations;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_response")
    private JsonNode rawResponse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shared_with_doctor_id")
    private Doctor sharedWithDoctor;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
