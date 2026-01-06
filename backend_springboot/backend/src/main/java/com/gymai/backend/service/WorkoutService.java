package com.gymai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gymai.backend.repository.WorkoutRepository;

import jakarta.persistence.EntityNotFoundException;

import com.gymai.backend.entity.Workout;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    public List<Workout> getUserWorkouts(Long userId){
        return workoutRepository.findByUserId(userId);
    }

    public List<Workout> getPredefinedWorkouts(){
        return workoutRepository.findByPredefinedTrue();
    }

    public Workout createUserWorkout(Workout workout){
        workout.setIsPredefined(false);
        return workoutRepository.save(workout);
    }

    public void deleteWorkout(Long workoutId){
        if(!workoutRepository.existsById(workoutId)){
            throw new EntityNotFoundException("Workout not found with id: " + workoutId);
        }
        workoutRepository.deleteById(workoutId);
    }
    
}
