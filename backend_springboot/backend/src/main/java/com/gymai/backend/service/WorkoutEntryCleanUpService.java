package com.gymai.backend.service;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.Schedules;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymai.backend.repository.WorkoutEntryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutEntryCleanUpService {

    private final WorkoutEntryRepository workoutEntryRepository;

    private static final int RETENTION_DAYS_COMPLETED = 90;

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanUpOldWorkoutEntries() {

        LocalDateTime cutoffCompleted = LocalDateTime.now().minusDays(RETENTION_DAYS_COMPLETED);

        Long deletionCompleted = workoutEntryRepository.deleteByCompletedAtIsNotNullAndCompletedAtBefore(cutoffCompleted);

        LocalDateTime cutOffIncomplete = LocalDateTime.now().minusDays(30);

        long deletedOngoing = workoutEntryRepository.deleteByCompletedAtIsNullAndStartedAtBefore(cutOffIncomplete);
        
    }
    
}
