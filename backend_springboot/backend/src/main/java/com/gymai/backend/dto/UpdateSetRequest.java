package com.gymai.backend.dto;

import lombok.Data;

@Data
public class UpdateSetRequest {
    private Double weight;
    private Integer reps;
    private Boolean completed;
}
