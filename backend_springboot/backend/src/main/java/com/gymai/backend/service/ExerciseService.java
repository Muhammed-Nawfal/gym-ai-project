package com.gymai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gymai.backend.entity.Exercise;
import com.gymai.backend.repository.ExerciseRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public Exercise addExercise(Exercise exercise){
        return exerciseRepository.save(exercise);
    }

    public List<Exercise> getAllExercise(){
        return exerciseRepository.findAll();
    }

    public Exercise getExerciseByID(Long id){
        return exerciseRepository.findById(id).orElseThrow(()-> new EntityNotFoundException("Exercise not found with id: " + id));
    }

    public void deleteExercise(Long id){
        if (!exerciseRepository.existsById(id)) {
            throw new EntityNotFoundException("Exercise not found with id: " + id);
        }
        exerciseRepository.deleteById(id);
    }
    
}
