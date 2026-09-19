package com.gymai.backend.service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymai.backend.repository.UserRepository;
import com.gymai.backend.repository.WorkoutExerciseRepository;
import com.gymai.backend.repository.WorkoutRepository;

import jakarta.persistence.EntityNotFoundException;

import com.gymai.backend.dto.AddWorkoutToRoutineRequest;
import com.gymai.backend.dto.UpdateWorkoutRequest;
import com.gymai.backend.dto.WorkoutDetailDto;
import com.gymai.backend.dto.WorkoutListDto;
import com.gymai.backend.entity.User;
import com.gymai.backend.entity.Workout;
import com.gymai.backend.entity.WorkoutExercise;
import com.gymai.backend.enums.MuscleGroup;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final UserRepository userRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;
    

    public List<WorkoutListDto> getUserWorkouts(Long userId){
        return workoutRepository.findByUserId(userId).stream().map(this::toListDto).toList();
    }

    public List<WorkoutListDto> getPredefinedWorkouts(){
        return workoutRepository.findByIsPredefinedTrue().stream().map(this::toListDto).toList();
    }

    public Workout createUserWorkout(Workout workout){
        workout.setIsPredefined(false);
        return workoutRepository.save(workout);
    }

    public void deleteWorkout(Long workoutId){
        if(!workoutRepository.existsById(workoutId)){
            throw new EntityNotFoundException("Workout not found with id: " + workoutId);
        }
        workoutRepository.deleteById(workoutId);
    }

    @Transactional
    public WorkoutListDto addTemplateToUserRoutine(AddWorkoutToRoutineRequest req) {

        if (req.getUserId() == null || req.getWorkoutId() == null) {
            throw new IllegalArgumentException("userId and workoutId are required");
        }

        User user = userRepository.findById(req.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + req.getUserId()));

        Workout template = workoutRepository.findById(req.getWorkoutId())
            .orElseThrow(() -> new IllegalArgumentException("Workout not found: " + req.getWorkoutId()));

        if (template.getIsPredefined() == null || !template.getIsPredefined()) {
            throw new IllegalArgumentException("Only predefined workouts can be added to routine");
        }

        if (workoutRepository.existsByUserIdAndPredefinedWorkoutId(req.getUserId(), template.getId())) {
            throw new IllegalStateException("Already added to your workouts.");
        }

        List<WorkoutExercise> templateExercises =
            workoutExerciseRepository.findByWorkoutIdOrderByOrderIndexAsc(template.getId());

        Workout copy = new Workout();
        copy.setUser(user);
        copy.setName(template.getName());
        copy.setDescription(template.getDescription());
        copy.setIsPredefined(false);
        copy.setMuscleGroups(new ArrayList<>(template.getMuscleGroups()));
        copy.setPredefinedWorkoutId(template.getId());

        copy = workoutRepository.save(copy);

        for (WorkoutExercise t : templateExercises) {
            WorkoutExercise we = new WorkoutExercise();
            we.setWorkout(copy);
            we.setExercise(t.getExercise());
            we.setOrderIndex(t.getOrderIndex());
            we.setTargetSets(t.getTargetSets());
            we.setTargetReps(t.getTargetReps());
            we.setTargetWeightKg(t.getTargetWeightKg());
            we.setRestSeconds(t.getRestSeconds());
            workoutExerciseRepository.save(we);
        }

        return toListDto(copy);
    }

    @Transactional
    public WorkoutDetailDto updateWorkout(Long workoutId, UpdateWorkoutRequest req, Authentication auth) {

        User me = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new AccessDeniedException("User not found"));

        Workout workout = workoutRepository.findById(workoutId)
            .orElseThrow(() -> new EntityNotFoundException("Workout not found"));

        if (Boolean.TRUE.equals(workout.getIsPredefined())) {
            throw new AccessDeniedException("Predefined workouts cannot be edited");
        }

        if (!workout.getUser().getId().equals(me.getId())) {
            throw new AccessDeniedException("You do not own this workout");
        }

        if (req.name() == null || req.name().trim().isEmpty()) {
            throw new IllegalArgumentException("Workout name is required");
        }

        if (req.muscleGroups().size() == 0 || req.muscleGroups() == null) {
            throw new IllegalArgumentException("Atleast one Muscle Group must be selected");
        }

        workout.setName(req.name().trim());
        workout.setDescription(req.description());
        workout.setMuscleGroups(req.muscleGroups());

        Workout saved = workoutRepository.save(workout);

        return toDetailDto(saved);
    }


    @Transactional
    public Workout applyWorkoutPlan(Long workoutId, String workoutName, List<WorkoutExercise> newExercises, Authentication auth) {
        User me = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new AccessDeniedException("User not found"));

        Workout workout;
        String finalWorkoutName = workoutName;
        if (workoutId != null) {
            workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new EntityNotFoundException("Workout not found"));

            if (Boolean.TRUE.equals(workout.getIsPredefined())) {
                throw new AccessDeniedException("Predefined workouts cannot be edited");
            }
            if (!workout.getUser().getId().equals(me.getId())) {
                throw new AccessDeniedException("You do not own this workout");
            }

            List<WorkoutExercise> existing = workoutExerciseRepository.findByWorkoutIdOrderByOrderIndexAsc(workoutId);
            workoutExerciseRepository.deleteAll(existing);
        } else {
            workout = new Workout();
            workout.setUser(me);
            workout.setIsPredefined(false);
            // New workouts created via the coach get a visible marker, since without one a
            // freshly-created "Push Workout" is indistinguishable in the workout list from an
            // unrelated existing workout the user named the same thing.
            if (!finalWorkoutName.endsWith("(Coach)")) {
                finalWorkoutName = finalWorkoutName + " (Coach)";
            }
        }

        workout.setName(finalWorkoutName);

        Set<MuscleGroup> muscleGroups = new LinkedHashSet<>();
        for (WorkoutExercise we : newExercises) {
            if (we.getExercise().getPrimaryMuscleGroup() != null) {
                muscleGroups.add(we.getExercise().getPrimaryMuscleGroup());
            }
        }
        workout.setMuscleGroups(new ArrayList<>(muscleGroups));

        workout = workoutRepository.save(workout);

        for (WorkoutExercise we : newExercises) {
            we.setWorkout(workout);
            workoutExerciseRepository.save(we);
        }

        return workout;
    }


    public WorkoutDetailDto getWorkoutDetail(Long workoutId) {
        Workout workout = workoutRepository.findById(workoutId)
            .orElseThrow(() -> new RuntimeException("Workout not found"));

        return toDetailDto(workout);
    }

    private WorkoutListDto toListDto(Workout w) {
        return new WorkoutListDto(
            w.getId(),
            w.getName(),
            w.getDescription(),
            w.getIsPredefined(),
            w.getMuscleGroups(),
            w.getPredefinedWorkoutId()
        );
    }

    private WorkoutDetailDto toDetailDto(Workout w) {
        return new WorkoutDetailDto(
            w.getId(),
            w.getName(),
            w.getDescription(),
            w.getIsPredefined(),
            w.getUser().getId(),
            w.getMuscleGroups(),
            w.getWorkoutExercises().stream()
                .map(we -> new WorkoutDetailDto.WorkoutExerciseDto(
                    we.getId(),
                    we.getExercise().getId(),
                    we.getExercise().getName(),
                    we.getExercise().getPrimaryMuscleGroup(),
                    we.getExercise().getSecondaryMuscleGroup(),
                    we.getExercise().getTertiaryMuscleGroup(),
                    we.getOrderIndex(),
                    we.getTargetSets(),
                    we.getTargetReps(),
                    we.getTargetWeightKg(),
                    we.getRestSeconds()
                ))
                .toList()
        );
    }
}