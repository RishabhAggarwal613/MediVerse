package com.mediverse.user.service;

import com.mediverse.auth.dto.UserDto;
import com.mediverse.common.api.ApiException;
import com.mediverse.storage.StorageService;
import com.mediverse.user.domain.Doctor;
import com.mediverse.user.domain.Patient;
import com.mediverse.user.domain.Role;
import com.mediverse.user.domain.User;
import com.mediverse.user.domain.VerificationStatus;
import com.mediverse.user.dto.OnboardingDto;
import com.mediverse.user.dto.UpdateMeRequest;
import com.mediverse.user.repository.DoctorRepository;
import com.mediverse.user.repository.PatientRepository;
import com.mediverse.user.repository.UserRepository;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final List<String> AVATAR_TYPES =
            List.of("image/jpeg", "image/jpg", "image/png", "image/webp");

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final StorageService storageService;

    @Transactional(readOnly = true)
    public UserDto me(User user) {
        User fresh = userRepository.findById(user.getId()).orElseThrow();
        return userDtoFor(fresh);
    }

    @Transactional
    public UserDto updateMe(User current, UpdateMeRequest req) {
        User user = userRepository.findById(current.getId()).orElseThrow();
        user.setFullName(req.fullName().trim());
        if (req.phone() != null && !req.phone().isBlank()) {
            user.setPhone(req.phone().trim());
        } else {
            user.setPhone(null);
        }
        userRepository.save(user);

        if (user.getRole() == Role.PATIENT) {
            Patient p =
                    patientRepository
                            .findByUserId(user.getId())
                            .orElseThrow(() -> new IllegalStateException("Patient row missing"));
            if (req.dateOfBirth() != null) {
                p.setDateOfBirth(req.dateOfBirth());
            }
            if (req.gender() != null) {
                p.setGender(req.gender());
            }
            if (req.bloodGroup() != null) {
                String bg = req.bloodGroup().trim();
                p.setBloodGroup(bg.isEmpty() ? null : bg);
            }
            if (req.allergies() != null) {
                String a = req.allergies().trim();
                p.setAllergies(a.isEmpty() ? null : a);
            }
            if (req.emergencyContact() != null) {
                String e = req.emergencyContact().trim();
                p.setEmergencyContact(e.isEmpty() ? null : e);
            }
            patientRepository.save(p);
        }

        return userDtoFor(userRepository.findById(user.getId()).orElseThrow());
    }

    @Transactional
    public UserDto updateAvatar(User current, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Avatar file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null || !AVATAR_TYPES.contains(contentType.toLowerCase())) {
            throw ApiException.badRequest("Avatar must be JPEG, PNG, or WebP");
        }

        User user = userRepository.findById(current.getId()).orElseThrow();
        String oldKey = user.getProfilePicUrl();

        String key =
                StorageService.buildKey(
                        StorageService.PROFILE_PICS_PREFIX, user.getId(), contentType);
        try {
            storageService.upload(key, file.getBytes(), contentType);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read uploaded avatar bytes", e);
        }
        user.setProfilePicUrl(key);

        userRepository.save(user);
        if (oldKey != null && !oldKey.equals(key)) {
            try {
                storageService.delete(oldKey);
            } catch (Exception ignored) {
                // best-effort cleanup
            }
        }
        return userDtoFor(user);
    }

    private UserDto userDtoFor(User user) {
        if (user.getRole() == Role.PATIENT) {
            Patient p =
                    patientRepository.findByUserId(user.getId()).orElse(null);
            return UserDto.from(user, storageService, p);
        }
        return UserDto.from(user, storageService, null);
    }

    @Transactional(readOnly = true)
    public OnboardingDto onboarding(User userRef) {
        User user =
                userRepository.findById(userRef.getId()).orElseThrow();
        Role role = user.getRole();
        List<OnboardingDto.Item> items = new ArrayList<>();

        boolean emailVerified = user.isEmailVerified();
        items.add(new OnboardingDto.Item("verify_email", "Verify your email address", emailVerified));

        boolean hasPhoto =
                user.getProfilePicUrl() != null && !user.getProfilePicUrl().isBlank();
        items.add(new OnboardingDto.Item("profile_photo", "Add a profile photo", hasPhoto));

        if (role == Role.PATIENT) {
            Patient p =
                    patientRepository.findByUserId(user.getId()).orElse(null);
            boolean basic =
                    p != null && p.getGender() != null && p.getDateOfBirth() != null;
            items.add(new OnboardingDto.Item(
                    "basic_profile", "Complete date of birth and gender", basic));
        } else {
            Doctor d = doctorRepository.findByUserId(user.getId()).orElseThrow();
            boolean approved =
                    d.getVerificationStatus() == VerificationStatus.APPROVED;
            items.add(
                    new OnboardingDto.Item("doctor_verified", "Get your license approved", approved));
            boolean profile =
                    d.getSpecialization() != null
                            && !d.getSpecialization().isBlank()
                            && d.getConsultationFee() != null;
            items.add(new OnboardingDto.Item(
                    "doctor_profile",
                    "Set specialization and consultation fee",
                    profile));
        }

        long done = items.stream().filter(OnboardingDto.Item::complete).count();
        return new OnboardingDto(items, (int) done, items.size());
    }
}
