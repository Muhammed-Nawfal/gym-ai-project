package com.gymai.backend.dto;

import java.util.List;
import com.gymai.backend.enums.MuscleGroup;

public record WorkoutDetailDto(
    Long id,
    String name,
    String description,
    Boolean isPredefined,
    Long userId,
    List<MuscleGroup> muscleGroups,
    List<WorkoutExerciseDto> exercises
) {
    public record WorkoutExerciseDto(
        Long id,
        Long exerciseId,
        String exerciseName,
        MuscleGroup primaryMuscleGroup,
        MuscleGroup secondaryMuscleGroup,
        MuscleGroup tertiaryMuscleGroup,
        Integer orderIndex,
        Integer targetSets,
        Integer targetReps,
        Integer targetWeightKg,
        Integer restSeconds
    ) {}
}
