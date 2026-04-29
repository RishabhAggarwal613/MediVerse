package com.mediverse.doctor.dto;

/** Curated taxonomy for dropdowns — doctors may store any string historically. */
public enum MedicalSpecialization {
    GENERAL_PHYSICIAN("General Physician"),
    CARDIOLOGY("Cardiology"),
    DERMATOLOGY("Dermatology"),
    ENT("ENT"),
    GASTROENTEROLOGY("Gastroenterology"),
    NEUROLOGY("Neurology"),
    ONCOLOGY("Oncology"),
    ORTHOPEDICS("Orthopedics"),
    PEDIATRICS("Pediatrics"),
    PSYCHIATRY("Psychiatry"),
    PULMONOLOGY("Pulmonology"),
    ENDOCRINOLOGY("Endocrinology");

    private final String label;

    MedicalSpecialization(String label) {
        this.label = label;
    }

    public String code() {
        return name();
    }

    public String label() {
        return label;
    }
}
