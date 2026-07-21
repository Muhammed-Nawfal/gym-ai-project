package com.gymai.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymai.backend.dto.PersonalRecordDto;
import com.gymai.backend.dto.PersonalRecordHistoryDto;
import com.gymai.backend.entity.Exercise;
import com.gymai.backend.entity.PersonalRecord;
import com.gymai.backend.entity.PersonalRecordHistory;
import com.gymai.backend.entity.User;
import com.gymai.backend.entity.WorkoutEntry;
import com.gymai.backend.repository.PersonalRecordHistoryRepository;
import com.gymai.backend.repository.PersonalRecordRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PersonalRecordService {

    private static final int RETENTION_DAYS_HISTORY = 90;

    private final PersonalRecordRepository personalRecordRepository;
    private final PersonalRecordHistoryRepository personalRecordHistoryRepository;

    @Transactional(readOnly = true)
    public List<PersonalRecordDto> getPersonalRecordsForUser(Long userId) {
        return personalRecordRepository.findByUserIdOrderByWeightDesc(userId).stream()
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<PersonalRecordHistoryDto> getHistoryForExercise(Long userId, Long exerciseId) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(RETENTION_DAYS_HISTORY);
        return personalRecordHistoryRepository
            .findByUserIdAndExerciseIdAndAchievedAtAfterOrderByAchievedAtDesc(userId, exerciseId, cutoff)
            .stream()
            .map(this::toHistoryDto)
            .toList();
    }

    @Transactional
    public void recordIfNewPersonalRecord(
        User user, Exercise exercise, WorkoutEntry workoutEntry, Double weight, Integer reps
    ) {
        if (weight == null || reps == null) return;

        Optional<PersonalRecord> existing =
            personalRecordRepository.findByUserIdAndExerciseId(user.getId(), exercise.getId());

        if (existing.isPresent() && existing.get().getWeight() >= weight) {
            return; // not a new record
        }

        LocalDateTime achievedAt = workoutEntry.getCompletedAt() != null
            ? workoutEntry.getCompletedAt()
            : LocalDateTime.now();

        PersonalRecord record = existing.orElseGet(PersonalRecord::new);
        record.setUser(user);
        record.setExercise(exercise);
        record.setWeight(weight);
        record.setReps(reps);
        record.setWorkoutEntry(workoutEntry);
        record.setAchievedAt(achievedAt);
        personalRecordRepository.save(record);

        PersonalRecordHistory historyEntry = new PersonalRecordHistory();
        historyEntry.setUser(user);
        historyEntry.setExercise(exercise);
        historyEntry.setWeight(weight);
        historyEntry.setReps(reps);
        historyEntry.setWorkoutEntry(workoutEntry);
        historyEntry.setAchievedAt(achievedAt);
        personalRecordHistoryRepository.save(historyEntry);
    }

    @Transactional
    public void pruneOldHistory() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(RETENTION_DAYS_HISTORY);
        personalRecordHistoryRepository.deleteByAchievedAtBefore(cutoff);
    }

    @Transactional
    public void handleWorkoutEntryDeletion(WorkoutEntry workoutEntry) {
        List<PersonalRecordHistory> historyRows =
            personalRecordHistoryRepository.findByWorkoutEntry_Id(workoutEntry.getId());
        personalRecordHistoryRepository.deleteAll(historyRows);

        List<PersonalRecord> currentRows =
            personalRecordRepository.findByWorkoutEntry_Id(workoutEntry.getId());

        for (PersonalRecord record : currentRows) {
            Optional<PersonalRecordHistory> nextBest = personalRecordHistoryRepository
                .findFirstByUserIdAndExerciseIdOrderByWeightDesc(
                    record.getUser().getId(), record.getExercise().getId());

            if (nextBest.isPresent()) {
                PersonalRecordHistory best = nextBest.get();
                record.setWeight(best.getWeight());
                record.setReps(best.getReps());
                record.setWorkoutEntry(best.getWorkoutEntry());
                record.setAchievedAt(best.getAchievedAt());
                personalRecordRepository.save(record);
            } else {
                personalRecordRepository.delete(record);
            }
        }
    }

    private PersonalRecordDto toDto(PersonalRecord record) {
        return new PersonalRecordDto(
            record.getExercise().getId(),
            record.getExercise().getName(),
            record.getWeight(),
            record.getReps(),
            record.getWeight() * record.getReps(),
            record.getAchievedAt(),
            record.getWorkoutEntry() != null ? record.getWorkoutEntry().getWorkout().getName() : null,
            record.getWorkoutEntry() != null ? record.getWorkoutEntry().getId() : null
        );
    }

    private PersonalRecordHistoryDto toHistoryDto(PersonalRecordHistory history) {
        return new PersonalRecordHistoryDto(
            history.getWeight(),
            history.getReps(),
            history.getWeight() * history.getReps(),
            history.getAchievedAt(),
            history.getWorkoutEntry() != null ? history.getWorkoutEntry().getWorkout().getName() : null,
            history.getWorkoutEntry() != null ? history.getWorkoutEntry().getId() : null
        );
    }
}