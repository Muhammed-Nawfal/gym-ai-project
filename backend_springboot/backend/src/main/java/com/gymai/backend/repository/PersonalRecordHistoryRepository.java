package com.gymai.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.PersonalRecordHistory;

@Repository
public interface PersonalRecordHistoryRepository extends JpaRepository<PersonalRecordHistory, Long> {

    List<PersonalRecordHistory> findByUserIdAndExerciseIdAndAchievedAtAfterOrderByAchievedAtDesc(
        Long userId, Long exerciseId, LocalDateTime cutoff);

    List<PersonalRecordHistory> findByWorkoutEntry_Id(Long workoutEntryId);

    Optional<PersonalRecordHistory> findFirstByUserIdAndExerciseIdOrderByWeightDesc(Long userId, Long exerciseId);

    void deleteByAchievedAtBefore(LocalDateTime cutoff);
}