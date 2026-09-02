package com.gymai.backend.dto;

import java.time.LocalDateTime;

public record PersonalRecordDto(
    Long exerciseId,
    String exerciseName,
    Double weight,
    Integer reps,
    Double volume,
    LocalDateTime achievedAt,
    String workoutName,
    Long workoutEntryId
) {}