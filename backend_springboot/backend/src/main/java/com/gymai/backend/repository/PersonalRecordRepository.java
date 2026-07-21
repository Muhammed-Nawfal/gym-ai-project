package com.gymai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.PersonalRecord;

@Repository
public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, Long> {

    Optional<PersonalRecord> findByUserIdAndExerciseId(Long userId, Long exerciseId);

    List<PersonalRecord> findByUserIdOrderByWeightDesc(Long userId);

    List<PersonalRecord> findByWorkoutEntry_Id(Long workoutEntryId);
}