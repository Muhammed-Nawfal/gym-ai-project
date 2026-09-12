package com.gymai.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProposedExerciseDto {
    private String exerciseName;
    private Integer sets;
    private Integer targetReps;
    private Integer restSeconds;
}