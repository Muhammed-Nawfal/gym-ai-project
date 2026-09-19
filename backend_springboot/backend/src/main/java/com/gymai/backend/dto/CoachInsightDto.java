package com.gymai.backend.dto;

import java.time.LocalDateTime;

public record CoachInsightDto(
    Long id,
    String exerciseName,
    String message,
    LocalDateTime createdAt,
    Boolean resolved
) {}
