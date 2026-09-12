package com.gymai.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.CoachInsight;

@Repository
public interface CoachInsightRepository extends JpaRepository<CoachInsight, Long> {
    List<CoachInsight> findByUserIdAndResolvedFalse(Long userId);  
    
    boolean existsByUserIdAndExerciseIdAndResolvedFalse(Long userId, Long exerciseId);
}
