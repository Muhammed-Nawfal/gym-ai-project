package com.gymai.backend.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.WorkoutEntry;

@Repository
public interface WorkoutEntryRepository extends JpaRepository<WorkoutEntry, Long>{

    List<WorkoutEntry> findByUserIdAndCompletedAt(Long userId, LocalDate completedAt);
    List<WorkoutEntry> findByUserId(Long userId);
    List<WorkoutEntry> findByUserIdOrderByStartedAtDesc(Long userId);

    Optional<WorkoutEntry> findFirstByUserIdAndCompletedAtIsNullOrderByStartedAtDesc(Long userId);

    long deleteByCompletedAtIsNotNullAndCompletedAtBefore(LocalDateTime cutoff);

    long deleteByCompletedAtIsNullAndStartedAtBefore(LocalDateTime cutoff);

    long countByUser_IdAndCompletedAtIsNotNull(Long userId);
} 
