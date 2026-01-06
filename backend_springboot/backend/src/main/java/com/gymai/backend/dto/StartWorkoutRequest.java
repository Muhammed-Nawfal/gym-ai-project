package com.gymai.backend.dto;

import lombok.Data;

@Data
public class StartWorkoutRequest {

    private Long userId;
    private Long workoutId;
    
}
