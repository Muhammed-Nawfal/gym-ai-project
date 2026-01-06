package com.gymai.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StartWorkoutResponse {
    private Long workoutEntryId;

    private Long workoutId;
    private String workoutName;

    private LocalDateTime startedAt;

    private List<SessionExerciseDto> exercises;
}
