package com.gymai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.gymai.backend.dto.AddWorkoutToRoutineRequest;
import com.gymai.backend.dto.UpdateWorkoutRequest;
import com.gymai.backend.dto.WorkoutDetailDto;
import com.gymai.backend.dto.WorkoutListDto;
import com.gymai.backend.entity.Workout;
import com.gymai.backend.service.WorkoutService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkoutListDto>> getUserWorkouts(@PathVariable Long userId){
        return ResponseEntity.ok(workoutService.getUserWorkouts(userId));
    }

    @GetMapping("/predefined")
    public ResponseEntity<List<WorkoutListDto>> getPredefinedWorkouts(){
        return ResponseEntity.ok(workoutService.getPredefinedWorkouts());
    }

    @PostMapping("/create")
    public ResponseEntity<Workout> createUserWorkout(@RequestBody Workout workout){
        return ResponseEntity.ok(workoutService.createUserWorkout(workout));
    }

    @DeleteMapping("/{workoutId}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long workoutId) {
        workoutService.deleteWorkout(workoutId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{workoutId}/details")
    public ResponseEntity<WorkoutDetailDto> getWorkoutDetail(@PathVariable Long workoutId) {
        return ResponseEntity.ok(workoutService.getWorkoutDetail(workoutId));
    }

    @PostMapping("/add-to-routine")
    public ResponseEntity<WorkoutListDto> addToRoutine(@RequestBody AddWorkoutToRoutineRequest req) {
        return ResponseEntity.ok(workoutService.addTemplateToUserRoutine(req));
    }

    @PutMapping("/{workoutId}")
    public ResponseEntity<WorkoutDetailDto> updateWorkout(
        @PathVariable Long workoutId,
        @RequestBody UpdateWorkoutRequest req,
        Authentication auth
    ) {
        return ResponseEntity.ok(workoutService.updateWorkout(workoutId, req, auth));
    }

}
