package com.mediverse.admin.dto;

import jakarta.validation.constraints.Size;

public record AdminRejectDoctorRequest(@Size(max = 500) String reason) {}
