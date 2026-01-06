package com.gymai.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PreviousExercisePerformanceResponse {
    private Long exerciseId;
    private String exerciseName;
    private LocalDateTime performedAt;
    private List<PreviousSetDto> sets;
}