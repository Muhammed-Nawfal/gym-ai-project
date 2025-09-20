package com.gymai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymai.backend.entity.Exercise;
import com.gymai.backend.service.ExerciseService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/exercise")
@RequiredArgsConstructor
public class ExerciseRepository {

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

    @GetMapping
    public ResponseEntity<Exercise> getExerciseById(@PathVariable Long id){
        return ResponseEntity.ok(exerciseService.getExerciseByID(id));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteExerciseById(@PathVariable Long id){
        exerciseService.deleteExercise(id);
        return ResponseEntity.noContent().build();
    }

    
}
