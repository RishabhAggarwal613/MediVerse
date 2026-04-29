package com.mediverse.ai.service;

import com.mediverse.ai.client.GeminiReportVisionClient;
import com.mediverse.ai.domain.AiReport;
import com.mediverse.ai.domain.AiReportFindingSnapshot;
import com.mediverse.ai.dto.AiReportDetailDto;
import com.mediverse.ai.dto.AiReportFindingDto;
import com.mediverse.ai.dto.AiReportSummaryDto;
import com.mediverse.ai.dto.ShareAiReportRequest;
import com.mediverse.ai.repository.AiReportRepository;
import com.mediverse.common.api.ApiException;
import com.mediverse.storage.StorageService;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.Patient;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import com.mediverse.user.repository.DoctorRepository;
import com.mediverse.user.repository.PatientRepository;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AiReportService {

    private static final int SUMMARY_SNIPPET_LEN = 220;
    private static final Set<String> ALLOWED_UPLOAD_TYPES =
            Set.of(
                    "image/jpeg",
                    "image/jpg",
                    "image/png",
                    "image/webp",
                    "application/pdf");

    private final AiReportRepository aiReportRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final StorageService storageService;
    private final GeminiReportVisionClient geminiReportVisionClient;

    @Transactional
    public AiReportDetailDto scan(User caller, MultipartFile file) {
        Patient patient = requirePatient(caller);
        validateUpload(file);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (Exception e) {
            throw ApiException.badRequest("Could not read uploaded file");
        }

        String mime = normalizeContentType(file.getContentType());

        String storageKey =
                StorageService.buildKey(
                        StorageService.REPORTS_PREFIX, patient.getId(), sanitizeMimeForStorage(mime));

        GeminiReportVisionClient.GeminiReportParseResult analyzed =
                geminiReportVisionClient.analyzeReport(bytes, mime);

        storageService.upload(storageKey, bytes, mime);

        AiReport entity =
                AiReport.builder()
                        .patient(patient)
                        .originalFilename(truncateFilename(file.getOriginalFilename()))
                        .fileUrl(storageKey)
                        .contentType(mime)
                        .summary(analyzed.summary())
                        .keyFindings(analyzed.findings())
                        .recommendations(analyzed.recommendations())
                        .rawResponse(analyzed.rawGeminiEnvelope())
                        .sharedWithDoctor(null)
                        .build();

        AiReport saved = aiReportRepository.save(entity);
        saved = aiReportRepository.findDetailById(saved.getId()).orElse(saved);
        return toDetail(saved, caller);
    }

    @Transactional(readOnly = true)
    public List<AiReportSummaryDto> listMine(User caller) {
        Patient patient = requirePatient(caller);
        List<AiReport> rows = aiReportRepository.findForPatientFetched(patient.getId());
        return rows.stream().map(AiReportService::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public AiReportDetailDto getById(User caller, long reportId) {
        AiReport report =
                aiReportRepository
                        .findDetailById(reportId)
                        .orElseThrow(() -> ApiException.notFound("Report not found."));

        Patient owner = report.getPatient();
        boolean isOwner = owner.getUser().getId().equals(caller.getId());

        if (caller.getRole() == Role.PATIENT && isOwner) {
            return toDetail(report, caller);
        }

        if (caller.getRole() == Role.DOCTOR) {
            Doctor doc =
                    doctorRepository
                            .findByUserId(caller.getId())
                            .orElseThrow(() -> ApiException.forbidden("Doctor profile required."));
            if (report.getSharedWithDoctor() == null
                    || !report.getSharedWithDoctor().getId().equals(doc.getId())) {
                throw ApiException.forbidden("This report has not been shared with you.");
            }
            return toDoctorDetail(report);
        }

        throw ApiException.forbidden("You cannot view this report.");
    }

    private AiReportDetailDto toDoctorDetail(AiReport report) {
        Doctor sharedDoc = report.getSharedWithDoctor();
        String doctorName =
                sharedDoc != null ? sharedDoc.getUser().getFullName() : null;

        return new AiReportDetailDto(
                report.getId(),
                report.getOriginalFilename(),
                report.getSummary(),
                report.getKeyFindings().stream().map(AiReportService::toFindingDto).toList(),
                report.getRecommendations(),
                sharedDoc != null ? sharedDoc.getId() : null,
                doctorName,
                report.getCreatedAt(),
                storageService.urlFor(report.getFileUrl()),
                false);
    }

    @Transactional
    public AiReportDetailDto share(User caller, long reportId, ShareAiReportRequest body) {
        Patient patient = requirePatient(caller);
        AiReport report = loadOwnedReport(reportId, patient.getId());

        Doctor target =
                doctorRepository
                        .findById(body.doctorId())
                        .filter(Doctor::isVerified)
                        .orElseThrow(() -> ApiException.notFound("Doctor not found or not verified."));

        report.setSharedWithDoctor(target);
        AiReport saved = aiReportRepository.save(report);
        return toDetail(saved, caller);
    }

    @Transactional
    public AiReportDetailDto unshare(User caller, long reportId) {
        Patient patient = requirePatient(caller);
        AiReport report = loadOwnedReport(reportId, patient.getId());
        report.setSharedWithDoctor(null);
        AiReport saved = aiReportRepository.save(report);
        return toDetail(saved, caller);
    }

    @Transactional
    public void delete(User caller, long reportId) {
        Patient patient = requirePatient(caller);
        AiReport report = loadOwnedReport(reportId, patient.getId());
        storageService.delete(report.getFileUrl());
        aiReportRepository.delete(report);
    }

    private AiReport loadOwnedReport(long reportId, long patientId) {
        AiReport report =
                aiReportRepository
                        .findById(reportId)
                        .orElseThrow(() -> ApiException.notFound("Report not found."));
        if (!report.getPatient().getId().equals(patientId)) {
            throw ApiException.notFound("Report not found.");
        }
        return report;
    }

    private AiReportDetailDto toDetail(AiReport report, User caller) {
        User owner = report.getPatient().getUser();
        boolean mayManage =
                caller.getRole() == Role.PATIENT && caller.getId().equals(owner.getId());
        String download = mayManage ? storageService.urlFor(report.getFileUrl()) : null;

        Doctor sd = report.getSharedWithDoctor();
        Long sharedId = sd != null ? sd.getId() : null;
        String sharedName = sd != null ? sd.getUser().getFullName() : null;

        return new AiReportDetailDto(
                report.getId(),
                report.getOriginalFilename(),
                report.getSummary(),
                report.getKeyFindings().stream().map(AiReportService::toFindingDto).toList(),
                report.getRecommendations(),
                sharedId,
                sharedName,
                report.getCreatedAt(),
                download,
                mayManage);
    }

    private static AiReportSummaryDto toSummary(AiReport report) {
        String s = report.getSummary();
        String snippet =
                s.length() <= SUMMARY_SNIPPET_LEN
                        ? s
                        : s.substring(0, SUMMARY_SNIPPET_LEN).strip() + "…";
        Doctor sd = report.getSharedWithDoctor();
        String sharedName =
                sd != null && sd.getUser() != null ? sd.getUser().getFullName() : null;

        return new AiReportSummaryDto(
                report.getId(), report.getOriginalFilename(), snippet, sharedName, report.getCreatedAt());
    }

    private static AiReportFindingDto toFindingDto(AiReportFindingSnapshot x) {
        return new AiReportFindingDto(
                n(x.getLabel()),
                n(x.getValue()),
                n(x.getUnit()),
                n(x.getRefRange()),
                n(x.getFlag()));
    }

    private static String n(String s) {
        return s != null ? s : "";
    }

    private Patient requirePatient(User caller) {
        if (caller.getRole() != Role.PATIENT) {
            throw ApiException.forbidden("Patients only.");
        }
        return patientRepository
                .findByUserId(caller.getId())
                .orElseThrow(() -> ApiException.forbidden("Patient profile required."));
    }

    private static void validateUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Attach a file.");
        }
        String ct = normalizeContentType(file.getContentType());
        if (!ALLOWED_UPLOAD_TYPES.contains(ct)) {
            throw ApiException.badRequest(
                    "Allowed types: JPEG, PNG, WebP, PDF. Got: "
                            + Optional.ofNullable(file.getContentType()).orElse("(none)"));
        }
    }

    private static String truncateFilename(String name) {
        if (name == null || name.isBlank()) {
            return "report";
        }
        String clean = name.replace("..", "").trim();
        byte[] b = clean.getBytes(StandardCharsets.UTF_8);
        if (b.length <= 255) {
            return clean;
        }
        return clean.substring(0, Math.min(clean.length(), 200)) + "…";
    }

    private static String normalizeContentType(String ct) {
        if (ct == null || ct.isBlank()) {
            return "";
        }
        return ct.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
    }

    private static String sanitizeMimeForStorage(String mime) {
        if ("image/jpg".equals(mime)) {
            return "image/jpeg";
        }
        return mime;
    }
}
