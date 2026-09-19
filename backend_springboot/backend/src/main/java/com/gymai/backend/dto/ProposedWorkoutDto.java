package com.gymai.backend.dto;

import java.util.List;

public record ProposedWorkoutDto(Long workoutId, String workoutName, List<ProposedExerciseDto> exercises) {}
