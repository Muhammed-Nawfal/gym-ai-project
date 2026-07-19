package com.gymai.backend.dto;

import java.util.List;
import com.gymai.backend.enums.MuscleGroup;

public record WorkoutListDto(
    Long id,
    String name,
    String description,
    Boolean isPredefined,
    List<MuscleGroup> muscleGroups,
    Long predefinedWorkoutId
) {}
