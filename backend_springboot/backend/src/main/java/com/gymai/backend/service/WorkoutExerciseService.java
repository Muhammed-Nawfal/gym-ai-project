package com.gymai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gymai.backend.dto.WorkoutExerciseRequest;
import com.gymai.backend.entity.Exercise;
import com.gymai.backend.entity.Workout;
import com.gymai.backend.entity.WorkoutExercise;
import com.gymai.backend.repository.ExerciseRepository;
import com.gymai.backend.repository.WorkoutExerciseRepository;
import com.gymai.backend.repository.WorkoutRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutExerciseService {

    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;

    public List<WorkoutExercise> getWorkoutExercises(Long workoutId) {
        return workoutExerciseRepository.findByWorkoutIdOrderByOrderIndexAsc(workoutId);
    }

    public WorkoutExercise addExerciseToWorkout(Long workoutId, WorkoutExerciseRequest req) {

        if (workoutExerciseRepository.existsByWorkoutIdAndExerciseId(workoutId, req.getExerciseId())) {
            throw new IllegalStateException("Exercise already exists in this workout");
        }

        Workout workout = workoutRepository.findById(workoutId)
            .orElseThrow(() -> new EntityNotFoundException("Workout not found"));

        Exercise exercise = exerciseRepository.findById(req.getExerciseId())
            .orElseThrow(() -> new EntityNotFoundException("Exercise not found"));

        WorkoutExercise we = new WorkoutExercise();
        we.setWorkout(workout);
        we.setExercise(exercise);
        we.setTargetSets(req.getTargetSets());
        we.setTargetReps(req.getTargetReps());
        we.setRestSeconds(req.getRestSeconds());
        we.setOrderIndex(req.getOrderIndex());

        return workoutExerciseRepository.save(we);
    }

    public WorkoutExercise updateWorkoutExercise(Long workoutExerciseId, WorkoutExerciseRequest req) {

        WorkoutExercise we = workoutExerciseRepository.findById(workoutExerciseId)
            .orElseThrow(() -> new EntityNotFoundException("Exercise not found"));

        we.setTargetSets(req.getTargetSets());
        we.setTargetReps(req.getTargetReps());
        we.setRestSeconds(req.getRestSeconds());
        we.setOrderIndex(req.getOrderIndex());
        we.setTargetWeightKg(req.getTargetWeightKg());

        return workoutExerciseRepository.save(we);
    }

    public void removeWorkoutExercise(Long workoutExerciseId) {
        workoutExerciseRepository.deleteById(workoutExerciseId);
    }
}
