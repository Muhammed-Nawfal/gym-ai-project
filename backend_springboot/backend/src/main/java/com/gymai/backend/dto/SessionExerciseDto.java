package com.gymai.backend.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SessionExerciseDto {
    private Long workoutEntryExerciseId;

    private Long exerciseId;
    private String exerciseName;

    private Integer orderIndex;
    private Integer targetSets;
    private Integer targetReps;
    private Integer restSeconds;

    private List<PreviousSetDto> previousSets;

    private List<SessionSetDto> currentSets;
}
