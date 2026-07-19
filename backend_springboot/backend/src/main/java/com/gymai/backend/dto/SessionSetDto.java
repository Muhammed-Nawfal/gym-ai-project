package com.gymai.backend.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SessionSetDto {
    private Long id;
    private Integer setIndex;
    private Double weight;
    private Integer reps;
    private Boolean completed;
    private LocalDateTime completedAt;
}
