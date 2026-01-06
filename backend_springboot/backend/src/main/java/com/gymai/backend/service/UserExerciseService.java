package com.gymai.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gymai.backend.dto.PreviousExercisePerformanceResponse;
import com.gymai.backend.dto.PreviousSetDto;
import com.gymai.backend.entity.UserExercise;
import com.gymai.backend.entity.WorkoutEntryExercise;
import com.gymai.backend.entity.WorkoutEntrySet;
import com.gymai.backend.repository.UserExerciseRepository;
import com.gymai.backend.repository.WorkoutEntrySetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserExerciseService {

    private final UserExerciseRepository userExerciseRepository;
    private final WorkoutEntrySetRepository workoutEntrySetRepository;

    public List<UserExercise> getUserExercises(Long userId) {
        return userExerciseRepository.findByUserId(userId);
    }

    public PreviousExercisePerformanceResponse getPreviousPerformance(Long userId, Long exerciseId) {

        UserExercise ue = userExerciseRepository
            .findByUserIdAndExerciseId(userId, exerciseId)
            .orElse(null);

        if (ue == null || ue.getLastWorkoutEntryExercise() == null) {
            return null; 
        }

        WorkoutEntryExercise last = ue.getLastWorkoutEntryExercise();

        List<WorkoutEntrySet> sets =
            workoutEntrySetRepository.findByWorkoutEntryExerciseIdOrderBySetIndexAsc(last.getId());

        LocalDateTime performedAt = null;
        if (last.getWorkoutEntry() != null) {
            performedAt = last.getWorkoutEntry().getCompletedAt() != null
                ? last.getWorkoutEntry().getCompletedAt()
                : last.getWorkoutEntry().getStartedAt();
        }

        return PreviousExercisePerformanceResponse.builder()
            .exerciseId(last.getExercise().getId())
            .exerciseName(last.getExercise().getName())
            .performedAt(performedAt)
            .sets(sets.stream()
                .map((WorkoutEntrySet s) -> PreviousSetDto.builder()
                    .setIndex(s.getSetIndex())
                    .weight(s.getWeight())
                    .reps(s.getReps())
                    .completed(s.getCompleted())
                    .build()
                )
                .collect(Collectors.toList())
            )
            .build();
    }
}
