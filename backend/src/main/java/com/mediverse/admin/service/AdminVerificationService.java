package com.mediverse.admin.service;

import com.mediverse.admin.dto.AdminPendingDoctorDto;
import com.mediverse.common.api.ApiException;
import com.mediverse.common.security.AdminAllowlist;
import com.mediverse.doctor.dto.PageResponse;
import com.mediverse.email.EmailService;
import com.mediverse.storage.StorageService;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.User;
import com.mediverse.user.domain.VerificationStatus;
import com.mediverse.user.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminVerificationService {

    private final DoctorRepository doctorRepository;
    private final AdminAllowlist adminAllowlist;
    private final EmailService emailService;
    private final StorageService storageService;

    private void assertAllowlisted(User caller) {
        if (!adminAllowlist.contains(caller.getEmail())) {
            throw ApiException.forbidden("Admin access required");
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<AdminPendingDoctorDto> listPending(User caller, int page, int size) {
        assertAllowlisted(caller);
        Page<Doctor> p =
                doctorRepository.findByVerificationStatusOrderByCreatedAtDesc(
                        VerificationStatus.PENDING,
                        PageRequest.of(
                                page,
                                Math.min(Math.max(size, 1), 50),
                                Sort.by(Sort.Direction.DESC, "createdAt")));

        return new PageResponse<>(
                p.map(this::toPendingDto).getContent(),
                p.getNumber(),
                p.getSize(),
                p.getTotalElements(),
                p.getTotalPages(),
                p.isLast());
    }

    @Transactional
    public void approve(User caller, long doctorId) {
        assertAllowlisted(caller);
        Doctor d = doctorRepository.findById(doctorId).orElseThrow(() -> ApiException.notFound("Doctor not found"));
        if (d.getVerificationStatus() != VerificationStatus.PENDING) {
            throw ApiException.conflict("Doctor is not pending verification");
        }
        d.setVerificationStatus(VerificationStatus.APPROVED);
        d.setVerified(true);
        d.setVerificationNote(null);
        doctorRepository.save(d);

        User u = d.getUser();
        emailService.sendDoctorVerified(u.getEmail(), u.getFullName());
    }

    @Transactional
    public void reject(User caller, long doctorId, String reason) {
        assertAllowlisted(caller);
        Doctor d = doctorRepository.findById(doctorId).orElseThrow(() -> ApiException.notFound("Doctor not found"));
        if (d.getVerificationStatus() != VerificationStatus.PENDING) {
            throw ApiException.conflict("Doctor is not pending verification");
        }
        d.setVerificationStatus(VerificationStatus.REJECTED);
        d.setVerified(false);
        String trimmed = reason == null ? "" : reason.trim();
        String note = trimmed.isEmpty() ? null : (trimmed.length() > 500 ? trimmed.substring(0, 500) : trimmed);
        d.setVerificationNote(note);
        doctorRepository.save(d);

        User u = d.getUser();
        String toDoctor = note == null || note.isBlank() ? "No reason was provided." : note;
        emailService.sendDoctorRejected(u.getEmail(), u.getFullName(), toDoctor);
    }

    private AdminPendingDoctorDto toPendingDto(Doctor d) {
        User u = d.getUser();
        String key = d.getLicenseDocUrl();
        String licenseUrl = key == null || key.isBlank() ? null : storageService.urlFor(key);
        return new AdminPendingDoctorDto(
                d.getId(),
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                d.getLicenseNumber(),
                d.getSpecialization(),
                licenseUrl,
                d.getCreatedAt());
    }
}
