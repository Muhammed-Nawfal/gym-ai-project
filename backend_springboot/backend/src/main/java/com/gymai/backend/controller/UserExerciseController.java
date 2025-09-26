package com.gymai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import com.gymai.backend.entity.UserExercise;
import com.gymai.backend.service.UserExerciseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user-exercise")
@RequiredArgsConstructor
public class UserExerciseController {

    private final UserExerciseService userExerciseService;

    @GetMapping("/{userid}")
    public ResponseEntity<List<UserExercise>> getUserExercises(@PathVariable Long userId){
        List<UserExercise> userExercises = userExerciseService.getUserExercises(userId);
        return ResponseEntity.ok(userExercises);
    }

    @GetMapping
    public ResponseEntity<UserExercise> getUserExerciseDetails(@PathVariable Long userId, Long exId){
        return ResponseEntity.ok(userExerciseService.getUserExerciseDetails(userId, exId));
    }

    @PutMapping("/{userId}/{exId}")
    public ResponseEntity<UserExercise> updatesSetsAndReps(@RequestBody UserExercise usx){
        return ResponseEntity.ok(userExerciseService.updatesSetsAndReps(usx));   
    }
    
}
