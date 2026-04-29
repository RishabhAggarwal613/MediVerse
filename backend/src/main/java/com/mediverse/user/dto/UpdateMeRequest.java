package com.mediverse.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateMeRequest(@NotBlank @Size(max = 120) String fullName, @Size(max = 20) String phone) {}
