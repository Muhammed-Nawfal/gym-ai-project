package com.gymai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gymai.backend.dto.PreviousExercisePerformanceResponse;
import com.gymai.backend.entity.UserExercise;
import com.gymai.backend.service.UserExerciseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user-exercise")
@RequiredArgsConstructor
public class UserExerciseController {

    private final UserExerciseService userExerciseService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserExercise>> getUserExercises(@PathVariable Long userId){
        List<UserExercise> userExercises = userExerciseService.getUserExercises(userId);
        return ResponseEntity.ok(userExercises);
    }

    @GetMapping("/user/{userId}/exercise/{exerciseId}/previous-performance")
    public ResponseEntity<PreviousExercisePerformanceResponse> getPreviousPerformance(@PathVariable Long userId, @PathVariable Long exerciseId){
        return ResponseEntity.ok(userExerciseService.getPreviousPerformance(userId, exerciseId));
    }
    
}
