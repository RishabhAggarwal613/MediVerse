package com.mediverse.doctor.service;

import com.mediverse.auth.dto.UserDto;
import com.mediverse.common.api.ApiException;
import com.mediverse.doctor.domain.DoctorAvailability;
import com.mediverse.doctor.domain.ScheduleDay;
import com.mediverse.doctor.domain.TimeSlot;
import com.mediverse.doctor.dto.DoctorAvailabilityRuleDto;
import com.mediverse.doctor.dto.DoctorDashboardStatsDto;
import com.mediverse.doctor.dto.DoctorPublicDto;
import com.mediverse.doctor.dto.DoctorSummaryDto;
import com.mediverse.doctor.dto.MedicalSpecialization;
import com.mediverse.doctor.dto.PageResponse;
import com.mediverse.doctor.dto.SpecializationOptionDto;
import com.mediverse.doctor.dto.TimeSlotItemDto;
import com.mediverse.doctor.dto.UpdateDoctorProfileRequest;
import com.mediverse.doctor.dto.UpsertAvailabilityRequest;
import com.mediverse.doctor.repository.DoctorAvailabilityRepository;
import com.mediverse.doctor.repository.TimeSlotRepository;
import com.mediverse.storage.StorageService;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import com.mediverse.user.domain.VerificationStatus;
import com.mediverse.user.repository.DoctorRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final SlotGenerationService slotGenerationService;
    private final StorageService storageService;

    public List<SpecializationOptionDto> listSpecializationOptions() {
        return Arrays.stream(MedicalSpecialization.values())
                .map(e -> new SpecializationOptionDto(e.code(), e.label()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<DoctorSummaryDto> searchDoctors(String q, String specialization, int page, int size) {
        Page<Doctor> p =
                doctorRepository.searchVisible(
                        blankToNull(q),
                        blankToNull(specialization),
                        VerificationStatus.APPROVED,
                        PageRequest.of(
                                page,
                                Math.min(Math.max(size, 1), 50),
                                Sort.by(Sort.Direction.ASC, "id")));

        Page<DoctorSummaryDto> mapped = p.map(this::toSummary);
        return new PageResponse<>(
                mapped.getContent(),
                mapped.getNumber(),
                mapped.getSize(),
                mapped.getTotalElements(),
                mapped.getTotalPages(),
                mapped.isLast());
    }

    @Transactional(readOnly = true)
    public DoctorPublicDto getDoctorPublic(Long doctorId) {
        Doctor d = doctorRepository.findById(doctorId).orElseThrow(() -> ApiException.notFound("Doctor not found"));
        if (!(d.isVerified() && d.getVerificationStatus() == VerificationStatus.APPROVED)) {
            throw ApiException.notFound("Doctor not found");
        }
        return toPublicDto(d);
    }

    @Transactional(readOnly = true)
    public DoctorPublicDto getMyDoctorProfile(User user) {
        Doctor d = doctorFor(user);
        return toPublicDto(d);
    }

    @Transactional
    public DoctorPublicDto updateMyDoctorProfile(User user, UpdateDoctorProfileRequest req) {
        Doctor d = doctorFor(user);

        if (req.specialization() != null) {
            String spec = req.specialization().trim();
            d.setSpecialization(spec.isBlank() ? null : spec);
        }
        if (req.qualifications() != null) {
            String qual = req.qualifications().trim();
            d.setQualifications(qual.isBlank() ? null : qual);
        }
        if (req.yearsExperience() != null) {
            d.setYearsExperience(req.yearsExperience());
        }
        if (req.consultationFee() != null) {
            d.setConsultationFee(req.consultationFee());
        }
        if (req.bio() != null) {
            String bio = req.bio().trim();
            d.setBio(bio.isBlank() ? null : bio);
        }

        doctorRepository.save(d);
        return toPublicDto(d);
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityRuleDto> listAvailabilityForOwner(User user) {
        Doctor d = doctorFor(user);
        return availabilityRepository.findByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(d.getId()).stream()
                .map(this::toRuleDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityRuleDto> listAvailabilityPublic(Long doctorId) {
        Doctor subject =
                doctorRepository.findById(doctorId).orElseThrow(() -> ApiException.notFound("Doctor not found"));
        if (!(subject.isVerified() && subject.getVerificationStatus() == VerificationStatus.APPROVED)) {
            throw ApiException.notFound("Doctor not found");
        }
        return availabilityRepository.findByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(doctorId).stream()
                .filter(DoctorAvailability::isActive)
                .map(this::toRuleDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorAvailabilityRuleDto addAvailabilityRule(User user, UpsertAvailabilityRequest req) {
        Doctor d = doctorFor(user);
        validateWindow(req.startTime(), req.endTime());
        assertNoOverlappingRules(d.getId(), req.dayOfWeek(), req.startTime(), req.endTime(), null);

        DoctorAvailability saved =
                availabilityRepository.save(
                        DoctorAvailability.builder()
                                .doctor(d)
                                .dayOfWeek(req.dayOfWeek())
                                .startTime(req.startTime())
                                .endTime(req.endTime())
                                .slotDurationMinutes(req.slotDurationMinutes())
                                .requiresApproval(req.requiresApproval())
                                .active(true)
                                .build());

        slotGenerationService.regenerateSlotsForDoctor(d.getId());
        return toRuleDto(saved);
    }

    @Transactional
    public DoctorAvailabilityRuleDto updateAvailabilityRule(User user, long ruleId, UpsertAvailabilityRequest req) {
        Doctor d = doctorFor(user);
        DoctorAvailability rule =
                availabilityRepository
                        .findById(ruleId)
                        .filter(r -> r.getDoctor().getId().equals(d.getId()))
                        .orElseThrow(() -> ApiException.notFound("Availability rule not found"));

        validateWindow(req.startTime(), req.endTime());
        assertNoOverlappingRules(d.getId(), req.dayOfWeek(), req.startTime(), req.endTime(), ruleId);

        rule.setDayOfWeek(req.dayOfWeek());
        rule.setStartTime(req.startTime());
        rule.setEndTime(req.endTime());
        rule.setSlotDurationMinutes(req.slotDurationMinutes());
        rule.setRequiresApproval(req.requiresApproval());

        availabilityRepository.save(rule);
        slotGenerationService.regenerateSlotsForDoctor(d.getId());
        return toRuleDto(rule);
    }

    @Transactional
    public void deleteAvailabilityRule(User user, long ruleId) {
        Doctor d = doctorFor(user);
        DoctorAvailability rule =
                availabilityRepository
                        .findById(ruleId)
                        .filter(r -> r.getDoctor().getId().equals(d.getId()))
                        .orElseThrow(() -> ApiException.notFound("Availability rule not found"));

        availabilityRepository.delete(rule);
        slotGenerationService.regenerateSlotsForDoctor(d.getId());
    }

    @Transactional(readOnly = true)
    public List<TimeSlotItemDto> listFreeSlots(Long doctorId, LocalDate date) {
        Doctor d = doctorRepository.findById(doctorId).orElseThrow(() -> ApiException.notFound("Doctor not found"));
        if (!(d.isVerified() && d.getVerificationStatus() == VerificationStatus.APPROVED)) {
            throw ApiException.notFound("Doctor not found");
        }

        List<TimeSlot> slots =
                timeSlotRepository.findByDoctor_IdAndSlotDateAndBookedFalseOrderByStartTimeAsc(doctorId, date);
        return slots.stream().map(this::toSlotDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorDashboardStatsDto dashboardStats(User user) {
        doctorFor(user); // validates role binds a doctor row
        return new DoctorDashboardStatsDto(0, 0, 0);
    }

    private Doctor doctorFor(User user) {
        if (user.getRole() != Role.DOCTOR) {
            throw ApiException.forbidden("Doctor account required");
        }
        return doctorRepository
                .findByUserId(user.getId())
                .orElseThrow(() -> ApiException.notFound("Doctor profile not found"));
    }

    private DoctorAvailabilityRuleDto toRuleDto(DoctorAvailability rule) {
        return new DoctorAvailabilityRuleDto(
                rule.getId(),
                rule.getDayOfWeek(),
                rule.getStartTime(),
                rule.getEndTime(),
                rule.getSlotDurationMinutes(),
                rule.isRequiresApproval(),
                rule.isActive());
    }

    private TimeSlotItemDto toSlotDto(TimeSlot slot) {
        return new TimeSlotItemDto(
                slot.getId(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.isRequiresApproval());
    }

    private DoctorSummaryDto toSummary(Doctor doctor) {
        User u = doctor.getUser();
        String picUrl =
                u.getProfilePicUrl() == null || u.getProfilePicUrl().isBlank()
                        ? null
                        : storageService.urlFor(u.getProfilePicUrl());
        return new DoctorSummaryDto(
                doctor.getId(),
                u.getFullName(),
                doctor.getSpecialization(),
                doctor.getConsultationFee(),
                picUrl);
    }

    private DoctorPublicDto toPublicDto(Doctor d) {
        User u = d.getUser();
        String phone = u.getPhone();
        UserDto usr = UserDto.from(u, storageService);
        return new DoctorPublicDto(
                d.getId(),
                usr,
                phone,
                d.getSpecialization(),
                d.getQualifications(),
                d.getYearsExperience(),
                d.getConsultationFee(),
                d.getBio(),
                d.isVerified());
    }

    private static void validateWindow(LocalTime start, LocalTime end) {
        if (!start.isBefore(end)) {
            throw ApiException.badRequest("start_time must be before end_time");
        }
    }

    private void assertNoOverlappingRules(
            long doctorId, ScheduleDay day, LocalTime start, LocalTime end, Long excludeRuleId) {
        availabilityRepository.findByDoctor_IdOrderByDayOfWeekAscStartTimeAsc(doctorId).stream()
                .filter(r -> r.getDayOfWeek() == day && r.isActive())
                .filter(r -> excludeRuleId == null || !excludeRuleId.equals(r.getId()))
                .filter(r -> overlaps(start, end, r.getStartTime(), r.getEndTime()))
                .findFirst()
                .ifPresent(r -> {
                    throw ApiException.conflict("Overlaps existing availability rule for that weekday");
                });
    }

    private static boolean overlaps(LocalTime s1, LocalTime e1, LocalTime s2, LocalTime e2) {
        return s1.isBefore(e2) && s2.isBefore(e1);
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }
}
