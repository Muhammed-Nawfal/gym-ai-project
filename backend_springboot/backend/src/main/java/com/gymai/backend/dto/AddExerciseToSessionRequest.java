package com.gymai.backend.dto;

import lombok.Data;

@Data
public class AddExerciseToSessionRequest {
    private Long exerciseId;

    private Integer orderIndex;
    private Integer targetSets;
    private Integer targetReps;
    private Integer restSeconds;
}
