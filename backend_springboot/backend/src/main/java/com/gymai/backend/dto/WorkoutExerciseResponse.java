package com.gymai.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WorkoutExerciseResponse {

    private Long id;
    private Long exerciseId;
    private String exerciseName;

    private Integer targetSets;
    private Integer targetWeightKg;
    private Integer targetReps;
    private Integer restSeconds;
    private Integer orderIndex;
}
