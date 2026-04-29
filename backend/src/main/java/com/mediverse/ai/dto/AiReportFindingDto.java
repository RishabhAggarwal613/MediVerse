package com.mediverse.ai.dto;

/** API row for extracted lab markers. */
public record AiReportFindingDto(String label, String value, String unit, String refRange, String flag) {}
