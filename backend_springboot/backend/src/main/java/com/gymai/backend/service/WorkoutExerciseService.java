package com.gymai.backend.service;

import java.util.*;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gymai.backend.dto.SyncWorkoutExercisesRequest;
import com.gymai.backend.dto.WorkoutExerciseRequest;
import com.gymai.backend.entity.Exercise;
import com.gymai.backend.entity.Workout;
import com.gymai.backend.entity.WorkoutExercise;
import com.gymai.backend.repository.ExerciseRepository;
import com.gymai.backend.repository.WorkoutExerciseRepository;
import com.gymai.backend.repository.WorkoutRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutExerciseService {

    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;

    public List<WorkoutExercise> getWorkoutExercises(Long workoutId) {
        return workoutExerciseRepository.findByWorkoutIdOrderByOrderIndexAsc(workoutId);
    }

    public WorkoutExercise addExerciseToWorkout(Long workoutId, WorkoutExerciseRequest req) {

        if (workoutExerciseRepository.existsByWorkoutIdAndExerciseId(workoutId, req.getExerciseId())) {
            throw new IllegalStateException("Exercise already exists in this workout");
        }

        Workout workout = workoutRepository.findById(workoutId)
            .orElseThrow(() -> new EntityNotFoundException("Workout not found"));

        Exercise exercise = exerciseRepository.findById(req.getExerciseId())
            .orElseThrow(() -> new EntityNotFoundException("Exercise not found"));

        WorkoutExercise we = new WorkoutExercise();
        we.setWorkout(workout);
        we.setExercise(exercise);
        we.setTargetSets(req.getTargetSets());
        we.setTargetReps(req.getTargetReps());
        we.setRestSeconds(req.getRestSeconds());
        we.setOrderIndex(req.getOrderIndex() != null
            ? req.getOrderIndex()
            : workoutExerciseRepository.findByWorkoutIdOrderByOrderIndexAsc(workoutId).size());
        we.setTargetWeightKg(req.getTargetWeightKg());

        return workoutExerciseRepository.save(we);
    }

    public WorkoutExercise updateWorkoutExercise(Long workoutExerciseId, WorkoutExerciseRequest req) {

        WorkoutExercise we = workoutExerciseRepository.findById(workoutExerciseId)
            .orElseThrow(() -> new EntityNotFoundException("Exercise not found"));

        if (req.getTargetSets() != null) we.setTargetSets(req.getTargetSets());
        if (req.getTargetReps() != null) we.setTargetReps(req.getTargetReps());
        if (req.getRestSeconds() != null) we.setRestSeconds(req.getRestSeconds());
        if (req.getOrderIndex() != null) we.setOrderIndex(req.getOrderIndex());
        if (req.getTargetWeightKg() != null) we.setTargetWeightKg(req.getTargetWeightKg());

        return workoutExerciseRepository.save(we);
    }

    public void removeWorkoutExercise(Long workoutExerciseId) {
        workoutExerciseRepository.deleteById(workoutExerciseId);
    }

    @Transactional
    public List<WorkoutExercise> syncWorkoutExercises(Long workoutId, SyncWorkoutExercisesRequest req) {

        List<Long> desiredExFromFrontEnd = (req.getExerciseIds() == null) ? List.of()
            : req.getExerciseIds().stream().filter(Objects::nonNull).distinct().toList();

        if (desiredExFromFrontEnd.isEmpty()) {
            throw new IllegalArgumentException("exerciseIds cannot be empty");
        }

        Workout workout = workoutRepository.findById(workoutId)
            .orElseThrow(() -> new EntityNotFoundException("Workout not found"));

        List<WorkoutExercise> existing =
            workoutExerciseRepository.findByWorkoutIdOrderByOrderIndexAsc(workoutId);

        Map<Long, WorkoutExercise> existingByExerciseId = new HashMap<>();

        for (WorkoutExercise we : existing) {
            existingByExerciseId.put(we.getExercise().getId(), we);
        }

        Set<Long> desiredExFromFrontEndSet = new HashSet<>(desiredExFromFrontEnd); //from the front-end

        List<WorkoutExercise> toRemove = existing.stream()
            .filter(we -> !desiredExFromFrontEndSet.contains(we.getExercise().getId()))
            .toList();
        if (!toRemove.isEmpty()) {
            workoutExerciseRepository.deleteAll(toRemove);
        }

        List<Long> toAddIds = desiredExFromFrontEnd.stream()
            .filter(id -> !existingByExerciseId.containsKey(id))
            .toList();

        if (!toAddIds.isEmpty()) {
            List<Exercise> exercises = exerciseRepository.findAllById(toAddIds);

            Set<Long> found = exercises.stream().map(Exercise::getId).collect(Collectors.toSet());
            for (Long id : toAddIds) {
                if (!found.contains(id)) throw new EntityNotFoundException("Exercise not found: " + id);
            }

            Map<Long, Exercise> exById = new HashMap<>();
            for (Exercise ex : exercises) exById.put(ex.getId(), ex);

            for (Long exId : toAddIds) {
                WorkoutExercise we = new WorkoutExercise();
                we.setWorkout(workout);
                we.setExercise(exById.get(exId));

                we.setTargetSets(3);
                we.setTargetReps(10);
                we.setRestSeconds(90);
                we.setTargetWeightKg(1);

                existingByExerciseId.put(exId, we);
            }
        }

        for (int i = 0; i < desiredExFromFrontEnd.size(); i++) {
            Long exId = desiredExFromFrontEnd.get(i);
            WorkoutExercise we = existingByExerciseId.get(exId);
            if (we == null) continue;
            we.setOrderIndex(i);
        }

        List<WorkoutExercise> finalRows = desiredExFromFrontEnd.stream()
            .map(existingByExerciseId::get)
            .filter(Objects::nonNull)
            .toList();

        workoutExerciseRepository.saveAll(finalRows);

        return workoutExerciseRepository.findByWorkoutIdOrderByOrderIndexAsc(workoutId);
    }

}
