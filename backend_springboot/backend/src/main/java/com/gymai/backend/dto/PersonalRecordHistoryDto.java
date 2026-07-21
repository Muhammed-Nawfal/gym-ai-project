package com.gymai.backend.dto;

import java.time.LocalDateTime;

public record PersonalRecordHistoryDto(
    Double weight,
    Integer reps,
    Double volume,
    LocalDateTime achievedAt,
    String workoutName,
    Long workoutEntryId
) {}