package com.gymai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gymai.backend.entity.WorkoutExercise;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {

    List<WorkoutExercise> findByWorkoutIdOrderByOrderIndexAsc(Long workoutId);

    boolean existsByWorkoutIdAndExerciseId(Long workoutId, Long exerciseId);

    Optional<WorkoutExercise> findByWorkoutIdAndExerciseId(Long workoutId, Long exerciseId);
}
