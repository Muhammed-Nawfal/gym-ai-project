package com.gymai.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.Exercise;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long>{
    boolean existsByName(String name);
}
