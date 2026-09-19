package com.gymai.backend.dto;

import java.util.List;

import com.gymai.backend.entity.Workout;

public record ApplyWorkoutPlanResponse(Workout workout, List<String> skippedExercises) {}
