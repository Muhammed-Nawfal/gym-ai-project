package com.gymai.backend.dto;

import lombok.Data;

@Data
public class AddWorkoutToRoutineRequest {
    private Long userId;
    private Long workoutId; 
}
