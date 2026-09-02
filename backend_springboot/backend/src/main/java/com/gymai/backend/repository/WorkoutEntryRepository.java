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
    List<WorkoutEntry> findByUserIdAndCompletedAtIsNotNullAndCompletedAtAfterOrderByCompletedAtDesc(Long userId, LocalDateTime cutoff);

    Optional<WorkoutEntry> findFirstByUserIdAndCompletedAtIsNullOrderByStartedAtDesc(Long userId);

    List<WorkoutEntry> findByCompletedAtIsNotNullAndCompletedAtBefore(LocalDateTime cutoff);

    List<WorkoutEntry> findByCompletedAtIsNullAndStartedAtBefore(LocalDateTime cutoff);

    long countByUser_IdAndCompletedAtIsNotNull(Long userId);
} 
