package com.gymai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gymai.backend.entity.Exercise;
import com.gymai.backend.service.ExerciseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/exercise")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseService exerciseService;

    @PostMapping("/add")
    public ResponseEntity<Exercise> add(@RequestBody Exercise ex){
        Exercise savedExercise = exerciseService.addExercise(ex);
        return ResponseEntity.ok(savedExercise);
    }

    @GetMapping
    public ResponseEntity<List<Exercise>> getAllExercises(){
        return ResponseEntity.ok(exerciseService.getAllExercise());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getExerciseById(@PathVariable Long id){
        return ResponseEntity.ok(exerciseService.getExerciseByID(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExerciseById(@PathVariable Long id){
        exerciseService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }

    
}
