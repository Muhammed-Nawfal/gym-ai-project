package com.gymai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gymai.backend.entity.WorkoutEntryExercise;

public interface WorkoutEntryExerciseRepository extends JpaRepository<WorkoutEntryExercise, Long> {

    List<WorkoutEntryExercise> findByWorkoutEntryIdOrderByOrderIndexAsc(Long workoutEntryId);

    Optional<WorkoutEntryExercise> findByWorkoutEntryIdAndExerciseId(Long workoutEntryId, Long exerciseId);
}
