package com.gymai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.Workout;

@Repository
public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    List<Workout> findByUserId(Long userId);

    List<Workout> findByIsPredefinedTrue();
    
    Optional<Workout> findByName(String name);

    boolean existsByUserIdAndPredefinedWorkoutId(Long userId, Long predefinedWorkoutId);

    
} 
