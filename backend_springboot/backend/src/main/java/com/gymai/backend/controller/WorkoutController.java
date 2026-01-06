package com.gymai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gymai.backend.entity.Workout;
import com.gymai.backend.service.WorkoutService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Workout>> getUserWorkouts(@PathVariable Long userId){
        return ResponseEntity.ok(workoutService.getUserWorkouts(userId));
    }

    @GetMapping("/predefined")
    public ResponseEntity<List<Workout>> getPredefinedWorkouts(){
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

    
}
