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

    private WorkoutRepository workoutRepository;

    public List<Workout> getUserWorkouts(Long userId){
        return workoutRepository.findByUserId(userId);
    }

    public Workout addWorkout(Workout workout){
        return workoutRepository.save(workout);
    }

    public void deleteWorkout(Long workoutId){
        if(!workoutRepository.existsById(workoutId)){
            throw new EntityNotFoundException("Exercise not found with id: " + workoutId);
        }
        workoutRepository.deleteById(workoutId);
    }
    
}
