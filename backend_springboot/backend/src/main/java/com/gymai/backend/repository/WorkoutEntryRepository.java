package com.gymai.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.WorkoutEntry;

@Repository
public interface WorkoutEntryRepository extends JpaRepository<WorkoutEntry, Long>{

    List<WorkoutEntry> findByUserIdAndPerformedDate(Long userId, LocalDate performedDate);
    List<WorkoutEntry> findByUserId(Long userId);
    List<WorkoutEntry> findByUserIdOrderByStartedAtDesc(Long userId);

    Optional<WorkoutEntry> findFirstByUserIdAndCompletedAtIsNullOrderByStartedAtDesc(Long userId);
} 
