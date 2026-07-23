package com.gymai.backend.service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymai.backend.dto.PersonalRecordDto;
import com.gymai.backend.dto.PersonalRecordHistoryDto;
import com.gymai.backend.dto.PersonalRecordStatsDto;
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

    @Transactional
    public PersonalRecordStatsDto getStatsForUser(Long userId){

        List<PersonalRecord> allRecords = personalRecordRepository.findByUserIdOrderByWeightDesc(userId);

        Double heaviestWeight = allRecords.isEmpty() ? null : allRecords.get(0).getWeight();
        String heaviestExerciseName = allRecords.isEmpty() ? null : allRecords.get(0).getExercise().getName();

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
        int totalThisMonth = (int) personalRecordHistoryRepository.countByUserIdAndAchievedAtBetween(userId, startOfMonth, LocalDateTime.now());

        LocalDateTime startOfMonthForImprovement = LocalDateTime.now().minusMonths(3);
        List<PersonalRecordHistory> history = personalRecordHistoryRepository.findByUserIdAndAchievedAtAfterOrderByExerciseIdAscAchievedAtAsc(userId, startOfMonthForImprovement);

        Map<Long, List<PersonalRecordHistory>> byExercise = history.stream().collect(Collectors.groupingBy(h -> h.getExercise().getId()));

        String mostImprovedExerciseName = null;
        Double mostImprovedPercent = null;

        for(List<PersonalRecordHistory> rows : byExercise.values()){
            if(rows.size() < 2) continue;

            double initialWeight = rows.get(0).getWeight();
            double finalWeight = rows.get(rows.size() - 1).getWeight();
            double improvementPercent = ((finalWeight - initialWeight) / initialWeight) * 100;

            if(mostImprovedPercent == null || improvementPercent > mostImprovedPercent){
                mostImprovedPercent = improvementPercent;
                mostImprovedExerciseName = rows.get(0).getExercise().getName();
            }
        }

        return new PersonalRecordStatsDto(
            heaviestWeight,
            heaviestExerciseName,
            totalThisMonth,
            mostImprovedExerciseName,
            mostImprovedPercent
        );
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