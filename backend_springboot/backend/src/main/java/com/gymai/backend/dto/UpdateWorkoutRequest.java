package com.gymai.backend.dto;

import java.util.List;
import com.gymai.backend.enums.MuscleGroup;

public record UpdateWorkoutRequest(
    String name,
    String description,
    List<MuscleGroup> muscleGroups
) {}
