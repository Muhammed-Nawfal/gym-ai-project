package com.gymai.backend.service;

import java.time.LocalDateTime;
import java.util.*;

import org.springframework.stereotype.Service;

import com.gymai.backend.dto.AddExerciseToSessionRequest;
import com.gymai.backend.dto.PreviousSetDto;
import com.gymai.backend.dto.SessionExerciseDto;
import com.gymai.backend.dto.SessionSetDto;
import com.gymai.backend.dto.StartWorkoutRequest;
import com.gymai.backend.dto.StartWorkoutResponse;
import com.gymai.backend.dto.UpdateSetRequest;
import com.gymai.backend.entity.Exercise;
import com.gymai.backend.entity.User;
import com.gymai.backend.entity.UserExercise;
import com.gymai.backend.entity.Workout;
import com.gymai.backend.entity.WorkoutEntry;
import com.gymai.backend.entity.WorkoutEntryExercise;
import com.gymai.backend.entity.WorkoutEntrySet;
import com.gymai.backend.entity.WorkoutExercise;
import com.gymai.backend.repository.ExerciseRepository;
import com.gymai.backend.repository.UserExerciseRepository;
import com.gymai.backend.repository.UserRepository;
import com.gymai.backend.repository.WorkoutEntryExerciseRepository;
import com.gymai.backend.repository.WorkoutEntryRepository;
import com.gymai.backend.repository.WorkoutEntrySetRepository;
import com.gymai.backend.repository.WorkoutExerciseRepository;
import com.gymai.backend.repository.WorkoutRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutSessionService {

    private final WorkoutEntryRepository workoutEntryRepository;
    private final WorkoutEntryExerciseRepository workoutEntryExerciseRepository;
    private final WorkoutEntrySetRepository workoutEntrySetRepository;

    private final WorkoutRepository workoutRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    private final UserExerciseRepository userExerciseRepository;

    //Service used when a workout session is started
    @Transactional
    public StartWorkoutResponse startWorkout(StartWorkoutRequest req){

        if (req.getUserId() == null || req.getWorkoutId() == null) {
            throw new IllegalArgumentException("userId and workoutId are required");
        }

        User user = userRepository.findById(req.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + req.getUserId()));

        Workout workout = workoutRepository.findById(req.getWorkoutId())
                .orElseThrow(() -> new IllegalArgumentException("Workout not found with id: " + req.getWorkoutId()));

        WorkoutEntry workoutEntry = new WorkoutEntry();
        workoutEntry.setUser(user);
        workoutEntry.setWorkout(workout);
        workoutEntry.setStartedAt(LocalDateTime.now());
        workoutEntry.setCompletedAt(null);
        workoutEntry = workoutEntryRepository.save(workoutEntry);

        List<WorkoutExercise> templateExercises = workoutExerciseRepository.findByWorkoutIdOrderByOrderIndexAsc(workout.getId());

        List<SessionExerciseDto> sessionExercises = new ArrayList<>();

        for(WorkoutExercise t : templateExercises){
            WorkoutEntryExercise ex = new WorkoutEntryExercise();
            ex.setWorkoutEntry(workoutEntry);
            ex.setExercise(t.getExercise());
            ex.setOrderIndex(t.getOrderIndex() == null ? 0 : t.getOrderIndex());
            ex.setRestSeconds(t.getRestSeconds());
            ex.setTargetReps(t.getTargetReps());
            ex.setTargetSets(t.getTargetSets());
            ex.setTargetWeightKg(t.getTargetWeightKg());
            ex = workoutEntryExerciseRepository.save(ex);

            int count = ex.getTargetSets() == null ? 0 : Math.max(ex.getTargetSets(), 0);
            List<WorkoutEntrySet> sets = new ArrayList<>();
            for(int i = 1; i <= count; i++){
                WorkoutEntrySet set = new WorkoutEntrySet();
                set.setWorkoutEntryExercise(ex);
                set.setSetIndex(i);
                set.setWeight(null);
                set.setReps(null);
                set.setCompleted(null);
                set.setCompletedAt(null);
                sets.add(workoutEntrySetRepository.save(set));
            }

            List<PreviousSetDto> previousSets = loadPreviousSets(user.getId(), ex.getExercise().getId());

            sessionExercises.add(toSessionExerciseDto(ex, previousSets, sets));
        }

        sessionExercises.sort(Comparator.comparing(SessionExerciseDto::getOrderIndex));

        return StartWorkoutResponse.builder()
            .workoutEntryId(workoutEntry.getId())
            .workoutId(workout.getId())
            .workoutName(workout.getName())
            .startedAt(workoutEntry.getStartedAt())
            .exercises(sessionExercises)
            .build();
    }

    //Adding an exercise while working out
    @Transactional
    public SessionExerciseDto addExerciseToSession(Long workoutEntryId, AddExerciseToSessionRequest req) {

        WorkoutEntry workoutEntry = workoutEntryRepository.findById(workoutEntryId)
            .orElseThrow(() -> new IllegalArgumentException("WorkoutEntry not found with id: " + workoutEntryId));

        Exercise exercise = exerciseRepository.findById(req.getExerciseId())
            .orElseThrow(() -> new IllegalArgumentException("Exercise not found with id: " + req.getExerciseId()));

        workoutEntryExerciseRepository.findByWorkoutEntryIdAndExerciseId(workoutEntry.getId(), exercise.getId())
            .ifPresent(ex -> {
                throw new IllegalArgumentException("This exercise is already present in this workout session");
            });
        
        WorkoutEntryExercise ex = new WorkoutEntryExercise();
        ex.setWorkoutEntry(workoutEntry);
        ex.setExercise(exercise);

        ex.setOrderIndex(req.getOrderIndex() == null ? 0 : req.getOrderIndex());
        ex.setTargetSets(req.getTargetSets());
        ex.setTargetReps(req.getTargetReps());
        ex.setRestSeconds(req.getRestSeconds());
        ex = workoutEntryExerciseRepository.save(ex);

        int count = ex.getTargetSets() == null ? 0 : Math.max(ex.getTargetSets(), 0);
        List<WorkoutEntrySet> newSetsForThisExercise = new ArrayList<>();

        for(int i=1;i<=count;i++){
            WorkoutEntrySet set = new WorkoutEntrySet();
            set.setWorkoutEntryExercise(ex);
            set.setSetIndex(i);
            set.setWeight(null);
            set.setReps(null);
            set.setCompleted(false);
            set.setCompletedAt(null);
            newSetsForThisExercise.add(workoutEntrySetRepository.save(set));
        }

        List<PreviousSetDto> previousSets = loadPreviousSets(workoutEntry.getUser().getId(), exercise.getId());
        return toSessionExerciseDto(ex, previousSets, newSetsForThisExercise);
    }

    //adding a set
    @Transactional
    public SessionSetDto addSetToExistingExercise(Long workoutEntryExerciseId){

        WorkoutEntryExercise ex = workoutEntryExerciseRepository.findById(workoutEntryExerciseId)
            .orElseThrow(() -> new IllegalArgumentException("WorkoutEntryExercise not found with id: " + workoutEntryExerciseId));

        int setIndex = Math.max(workoutEntrySetRepository.countByWorkoutEntryExerciseId(ex.getId()).intValue() + 1, 1);

        WorkoutEntrySet set = new WorkoutEntrySet();
        set.setWorkoutEntryExercise(ex);
        set.setReps(null);
        set.setWeight(null);
        set.setCompleted(false);
        set.setCompletedAt(null);
        set.setSetIndex(setIndex);
        
        set = workoutEntrySetRepository.save(set);

        return toSessionSetDto(set);
    }

    //Updating a set
    @Transactional
    public SessionSetDto updateSet(Long setId, UpdateSetRequest req){

        WorkoutEntrySet set = workoutEntrySetRepository.findById(setId)
            .orElseThrow(() -> new IllegalArgumentException("WorkoutEntrySet not found with id: " + setId));

        if(req.getWeight() != null){
            set.setWeight(req.getWeight());
        }
        if(req.getReps() != null){
            set.setReps(req.getReps());
        }
        if(req.getCompleted() != null){
            set.setCompleted(req.getCompleted());
            if(req.getCompleted()){
                set.setCompletedAt(LocalDateTime.now());
            } else {
                set.setCompletedAt(null);
            }
        }

        set = workoutEntrySetRepository.save(set);

        return toSessionSetDto(set);

    }

    //DELETING A SET
    @Transactional
    public void deleteSet(Long setId){
        if(!workoutEntrySetRepository.existsById(setId)){
            throw new IllegalArgumentException("WorkoutEntrySet not found with id: " + setId);
        }
        workoutEntrySetRepository.deleteById(setId);
    }

    //finish workout
    @Transactional
    public void finishWorkoutSession(Long workoutEntryId){
        WorkoutEntry workoutEntry = workoutEntryRepository.findById(workoutEntryId)
            .orElseThrow(() -> new IllegalArgumentException("WorkoutEntry not found with id: " + workoutEntryId));

        if(workoutEntry.getCompletedAt() != null){
            throw new IllegalArgumentException("Workout session is already completed");
        }

        workoutEntry.setCompletedAt(LocalDateTime.now());
        workoutEntryRepository.save(workoutEntry);

        List<WorkoutEntryExercise> currentSessionExercises = workoutEntryExerciseRepository.findByWorkoutEntryIdOrderByOrderIndexAsc(workoutEntryId);

        for(WorkoutEntryExercise ex : currentSessionExercises){
            updateUserExerciseLastPerformed(
                workoutEntry.getUser(),
                ex.getExercise(),
                ex,
                LocalDateTime.now()                
            );
        }
        
    }

    @Transactional(readOnly = true)
    public StartWorkoutResponse getSession(Long workoutEntryId){

        WorkoutEntry workoutEntry = workoutEntryRepository.findById(workoutEntryId)
            .orElseThrow(() -> new IllegalArgumentException("WorkoutEntry not found with id: " + workoutEntryId));

        List<WorkoutEntryExercise> sessionExercises = workoutEntryExerciseRepository.findByWorkoutEntryIdOrderByOrderIndexAsc(workoutEntryId);

        List<SessionExerciseDto> currentSessionsExercises = sessionExercises.stream()
            .map( ex -> {
                List<WorkoutEntrySet> currentSets = workoutEntrySetRepository.findByWorkoutEntryExerciseIdOrderBySetIndexAsc(ex.getId());
                List<PreviousSetDto> previousSets = loadPreviousSets(workoutEntry.getUser().getId(), ex.getExercise().getId());
                return toSessionExerciseDto(ex, previousSets, currentSets);
            })
            .toList();

        return StartWorkoutResponse.builder()
            .workoutEntryId(workoutEntry.getId())
            .workoutName(workoutEntry.getWorkout().getName())
            .workoutId(workoutEntry.getWorkout().getId())
            .startedAt(workoutEntry.getStartedAt())
            .exercises(currentSessionsExercises)
            .build();
    }

    @Transactional(readOnly = true)
    public StartWorkoutResponse getCurrentActiveSessionForUser(Long userId) {
        WorkoutEntry activeEntry = workoutEntryRepository
            .findFirstByUserIdAndCompletedAtIsNullOrderByStartedAtDesc(userId)
            .orElseThrow(() -> new EntityNotFoundException("No active workout session found for user with id: " + userId));

        return getSession(activeEntry.getId());
    }
    
    private List<PreviousSetDto> loadPreviousSets(Long userId, Long exerciseId) {
        return userExerciseRepository.findByUserIdAndExerciseId(userId, exerciseId)
            .map(UserExercise::getLastWorkoutEntryExercise)
            .map(last -> workoutEntrySetRepository
                .findByWorkoutEntryExerciseIdOrderBySetIndexAsc(last.getId())
                .stream()
                .map(s -> PreviousSetDto.builder()
                    .setIndex(s.getSetIndex())
                    .weight(s.getWeight())
                    .reps(s.getReps())
                    .build())
                .toList()
            )
            .orElse(List.of());
    }

    private void updateUserExerciseLastPerformed(User user, Exercise ex, WorkoutEntryExercise lastWorkoutEntryExercise, LocalDateTime performedAt) {
        UserExercise userExercise = userExerciseRepository
            .findByUserIdAndExerciseId(user.getId(), ex.getId())
            .orElseGet(UserExercise::new);

        userExercise.setUser(user);
        userExercise.setExercise(ex);
        userExercise.setLastWorkoutEntryExercise(lastWorkoutEntryExercise);
        userExercise.setLastPerformedAt(performedAt);
        userExerciseRepository.save(userExercise);
    }

    private SessionExerciseDto toSessionExerciseDto(
        WorkoutEntryExercise ex,
        List<PreviousSetDto> previousSets,
        List<WorkoutEntrySet> currentSets
    ){

        List<SessionSetDto> current = currentSets.stream()
            .sorted(Comparator.comparing(WorkoutEntrySet::getSetIndex))
            .map(this::toSessionSetDto)
            .toList();

        return SessionExerciseDto.builder()
            .workoutEntryExerciseId(ex.getId())
            .exerciseId(ex.getExercise().getId())
            .exerciseName(ex.getExercise().getName())
            .restSeconds(ex.getRestSeconds())
            .orderIndex(ex.getOrderIndex())
            .targetSets(ex.getTargetSets())
            .targetReps(ex.getTargetReps())
            .previousSets(previousSets)
            .currentSets(current)
            .build();
    }

    private SessionSetDto toSessionSetDto(WorkoutEntrySet set) {
        return SessionSetDto.builder()
            .id(set.getId())
            .setIndex(set.getSetIndex())
            .weight(set.getWeight())
            .reps(set.getReps())
            .completed(set.getCompleted())
            .completedAt(set.getCompletedAt())
            .build();
    }
}
