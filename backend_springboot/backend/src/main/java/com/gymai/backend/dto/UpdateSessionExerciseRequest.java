package com.gymai.backend.dto;

import lombok.Data;

@Data
public class UpdateSessionExerciseRequest {
    private Integer restSeconds;
    private Integer orderIndex;
    private String notes;
}
