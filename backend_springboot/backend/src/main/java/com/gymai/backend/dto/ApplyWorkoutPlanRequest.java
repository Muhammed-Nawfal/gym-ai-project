package com.gymai.backend.dto;

import java.util.List;

public record ApplyWorkoutPlanRequest(Long workoutId, String workoutName, List<ProposedExerciseDto> exercises) {}