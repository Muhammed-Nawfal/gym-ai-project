package com.gymai.backend.dto;

public record PersonalRecordStatsDto(
    Double heaviestWeight,
    String heaviestExerciseName,
    Integer totalThisMonth,
    String mostImprovedExerciseName,
    Double mostImprovedPercent
) {}
