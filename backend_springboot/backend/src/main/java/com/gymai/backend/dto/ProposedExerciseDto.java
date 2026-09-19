package com.gymai.backend.dto;

import com.gymai.backend.enums.MuscleGroup;

import lombok.Data;

@Data
public class ProposedExerciseDto {
    private String exerciseName;
    private Integer sets;
    private Integer targetReps;
    private Integer restSeconds;
    private MuscleGroup primaryMuscleGroup;
    private MuscleGroup secondaryMuscleGroup;
}