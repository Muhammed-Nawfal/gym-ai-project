package com.gymai.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymai.backend.entity.WorkoutEntry;
import com.gymai.backend.repository.WorkoutEntryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutEntryCleanUpService {

    private final WorkoutEntryRepository workoutEntryRepository;
    private final WorkoutSessionService workoutSessionService;
    private final PersonalRecordService personalRecordService;

    private static final int RETENTION_DAYS_COMPLETED = 90;
    private static final int RETENTION_DAYS_INCOMPLETE = 30;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanUpOldWorkoutEntries() {

        LocalDateTime cutoffCompleted = LocalDateTime.now().minusDays(RETENTION_DAYS_COMPLETED);
        List<WorkoutEntry> oldCompleted =
            workoutEntryRepository.findByCompletedAtIsNotNullAndCompletedAtBefore(cutoffCompleted);
        oldCompleted.forEach(workoutSessionService::deleteWorkoutEntryAndChildren);

        LocalDateTime cutoffIncomplete = LocalDateTime.now().minusDays(RETENTION_DAYS_INCOMPLETE);
        List<WorkoutEntry> oldIncomplete =
            workoutEntryRepository.findByCompletedAtIsNullAndStartedAtBefore(cutoffIncomplete);
        oldIncomplete.forEach(workoutSessionService::deleteWorkoutEntryAndChildren);

        personalRecordService.pruneOldHistory();
    }

}
