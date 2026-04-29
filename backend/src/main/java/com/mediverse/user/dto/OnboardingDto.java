package com.mediverse.user.dto;

import java.util.List;

/** Dashboard checklist — items auto-dismiss when {@code complete} is true. */
public record OnboardingDto(List<Item> items, int completedCount, int totalCount) {

    public record Item(String id, String label, boolean complete) {}
}
