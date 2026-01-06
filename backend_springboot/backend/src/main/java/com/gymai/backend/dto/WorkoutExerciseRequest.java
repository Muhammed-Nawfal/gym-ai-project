package com.gymai.backend.dto;

import lombok.Data;

@Data
public class WorkoutExerciseRequest {

    private Long exerciseId;
    private Integer targetSets;
    private Integer targetReps;
    private Integer restSeconds;
    private Integer orderIndex;
    private Integer targetWeightKg;
}
