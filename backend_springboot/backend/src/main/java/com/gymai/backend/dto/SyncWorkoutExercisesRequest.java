package com.gymai.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class SyncWorkoutExercisesRequest {
    private List<Long> exerciseIds;
}
