package com.gymai.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gymai.backend.entity.WorkoutEntrySet;

public interface WorkoutEntrySetRepository extends JpaRepository<WorkoutEntrySet, Long> {

    List<WorkoutEntrySet> findByWorkoutEntryExerciseIdOrderBySetIndexAsc(Long workoutEntryExerciseId);

    Long countByWorkoutEntryExerciseId(Long id);
}
