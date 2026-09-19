package com.gymai.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.Exercise;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long>{
    boolean existsByName(String name);
    
    @Query(value = """
            SELECT e.* FROM exercise e
            JOIN user_exercise ue ON ue.exercise_id = e.id
            WHERE ue.user_id = :userId
            AND similarity(e.name, :name) > 0.3
            ORDER BY similarity(e.name, :name) DESC
            LIMIT 1
            """, nativeQuery = true)
    Optional<Exercise> findClosestByNameForUser(@Param("userId") Long userId, @Param("name") String name);

    @Query(value = """
            SELECT e.* FROM exercise e
            WHERE similarity(e.name, :name) > 0.3
            ORDER BY similarity(e.name, :name) DESC
            LIMIT 1
            """, nativeQuery = true)
    Optional<Exercise> findClosestByNameGlobal(@Param("name") String name);
}
