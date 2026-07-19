package com.gymai.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PreviousSetDto {
    private Integer setIndex;
    private Integer reps;
    private Double weight;
    private Boolean completed;
}
