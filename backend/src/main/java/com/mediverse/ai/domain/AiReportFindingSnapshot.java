package com.mediverse.ai.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Persisted Gemini-extracted lab finding row (stored in {@code ai_reports.key_findings} JSON). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiReportFindingSnapshot implements Serializable {

    private String label;
    private String value;
    private String unit;
    private String refRange;
    /** e.g. HIGH, LOW, ABNORMAL, NORMAL */
    private String flag;
}
