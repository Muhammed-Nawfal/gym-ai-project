package com.gymai.backend.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gymai.backend.dto.SyncWorkoutExercisesRequest;
import com.gymai.backend.dto.WorkoutExerciseRequest;
import com.gymai.backend.dto.WorkoutExerciseResponse;
import com.gymai.backend.entity.WorkoutExercise;
import com.gymai.backend.service.WorkoutExerciseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workouts/{workoutId}/exercises")
@RequiredArgsConstructor
public class WorkoutExerciseController {

    private final WorkoutExerciseService workoutExerciseService;

    @GetMapping
    public ResponseEntity<List<WorkoutExerciseResponse>> getWorkoutExercises(
            @PathVariable Long workoutId
    ) {
        List<WorkoutExerciseResponse> response =
            workoutExerciseService.getWorkoutExercises(workoutId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<WorkoutExerciseResponse> addExerciseToWorkout(
            @PathVariable Long workoutId,
            @RequestBody WorkoutExerciseRequest req
    ) {
        WorkoutExercise we = workoutExerciseService.addExerciseToWorkout(workoutId, req);
        return ResponseEntity.ok(toResponse(we));
    }

    @PutMapping("/{workoutExerciseId}")
    public ResponseEntity<WorkoutExerciseResponse> updateWorkoutExercise(
            @PathVariable Long workoutExerciseId,
            @RequestBody WorkoutExerciseRequest req
    ) {
        WorkoutExercise we = workoutExerciseService.updateWorkoutExercise(workoutExerciseId, req);
        return ResponseEntity.ok(toResponse(we));
    }

    @DeleteMapping("/{workoutExerciseId}")
    public ResponseEntity<Void> removeWorkoutExercise(
            @PathVariable Long workoutExerciseId
    ) {
        workoutExerciseService.removeWorkoutExercise(workoutExerciseId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/sync")
    public ResponseEntity<List<WorkoutExerciseResponse>> syncWorkoutExercises(
            @PathVariable Long workoutId,
            @RequestBody SyncWorkoutExercisesRequest req
    ) {
        List<WorkoutExerciseResponse> response =
            workoutExerciseService.syncWorkoutExercises(workoutId, req)
                .stream()
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }



    private WorkoutExerciseResponse toResponse(WorkoutExercise we) {
        return WorkoutExerciseResponse.builder()
            .id(we.getId())
            .exerciseId(we.getExercise().getId())
            .exerciseName(we.getExercise().getName())
            .targetSets(we.getTargetSets())
            .targetReps(we.getTargetReps())
            .restSeconds(we.getRestSeconds())
            .orderIndex(we.getOrderIndex())
            .targetWeightKg(we.getTargetWeightKg())
            .build();
    }
    
}
