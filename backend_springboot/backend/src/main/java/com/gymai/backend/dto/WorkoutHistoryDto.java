package com.gymai.backend.dto;

import java.time.LocalDateTime;

public record WorkoutHistoryDto(
    Long workoutEntryId,
    String workoutName,
    LocalDateTime startedAt,
    LocalDateTime completedAt,
    Integer totalSets,
    Double totalVolume
) {}