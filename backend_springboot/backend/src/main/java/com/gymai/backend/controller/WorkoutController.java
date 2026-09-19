package com.gymai.backend.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.gymai.backend.dto.AddWorkoutToRoutineRequest;
import com.gymai.backend.dto.ApplyWorkoutPlanRequest;
import com.gymai.backend.dto.ApplyWorkoutPlanResponse;
import com.gymai.backend.dto.ProposedExerciseDto;
import com.gymai.backend.dto.UpdateWorkoutRequest;
import com.gymai.backend.dto.WorkoutDetailDto;
import com.gymai.backend.dto.WorkoutListDto;
import com.gymai.backend.entity.Exercise;
import com.gymai.backend.entity.User;
import com.gymai.backend.entity.Workout;
import com.gymai.backend.entity.WorkoutExercise;
import com.gymai.backend.repository.ExerciseRepository;
import com.gymai.backend.repository.UserRepository;
import com.gymai.backend.service.WorkoutService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkoutListDto>> getUserWorkouts(@PathVariable Long userId){
        return ResponseEntity.ok(workoutService.getUserWorkouts(userId));
    }

    @GetMapping("/predefined")
    public ResponseEntity<List<WorkoutListDto>> getPredefinedWorkouts(){
        return ResponseEntity.ok(workoutService.getPredefinedWorkouts());
    }

    @PostMapping("/create")
    public ResponseEntity<Workout> createUserWorkout(@RequestBody Workout workout){
        return ResponseEntity.ok(workoutService.createUserWorkout(workout));
    }

    @DeleteMapping("/{workoutId}")
    public ResponseEntity<Void> deleteWorkout(@PathVariable Long workoutId) {
        workoutService.deleteWorkout(workoutId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{workoutId}/details")
    public ResponseEntity<WorkoutDetailDto> getWorkoutDetail(@PathVariable Long workoutId) {
        return ResponseEntity.ok(workoutService.getWorkoutDetail(workoutId));
    }

    @PostMapping("/add-to-routine")
    public ResponseEntity<WorkoutListDto> addToRoutine(@RequestBody AddWorkoutToRoutineRequest req) {
        return ResponseEntity.ok(workoutService.addTemplateToUserRoutine(req));
    }

    @PutMapping("/{workoutId}")
    public ResponseEntity<WorkoutDetailDto> updateWorkout(
        @PathVariable Long workoutId,
        @RequestBody UpdateWorkoutRequest req,
        Authentication auth
    ) {
        return ResponseEntity.ok(workoutService.updateWorkout(workoutId, req, auth));
    }

    @PostMapping("/apply-plan")
    public ResponseEntity<ApplyWorkoutPlanResponse> applyWorkoutPlan(@RequestBody ApplyWorkoutPlanRequest request, Authentication auth) {
        List<WorkoutExercise> workoutExercises = new ArrayList<>();
        List<String> skippedExercises = new ArrayList<>();
        int orderIndex = 0;
        for (ProposedExerciseDto proposed : request.exercises()) {
            Exercise exercise = exerciseRepository.findClosestByNameGlobal(proposed.getExerciseName())
                    .orElse(null);

            if (exercise == null) {
                if (proposed.getPrimaryMuscleGroup() == null) {
                    // Can't create an exercise without its required primary muscle group -
                    // this should be rare since the agent is instructed to always provide one.
                    skippedExercises.add(proposed.getExerciseName());
                    continue;
                }

                User me = userRepository.findByEmail(auth.getName()).orElse(null);
                Exercise newExercise = new Exercise();
                newExercise.setName(proposed.getExerciseName());
                newExercise.setPrimaryMuscleGroup(proposed.getPrimaryMuscleGroup());
                newExercise.setSecondaryMuscleGroup(proposed.getSecondaryMuscleGroup());
                newExercise.setCreatedBy(me);
                exercise = exerciseRepository.save(newExercise);
            }

            WorkoutExercise we = new WorkoutExercise();
            we.setExercise(exercise);
            we.setOrderIndex(orderIndex++);
            we.setTargetSets(proposed.getSets());
            we.setTargetReps(proposed.getTargetReps());
            we.setRestSeconds(proposed.getRestSeconds());
            workoutExercises.add(we);
        }

        Workout saved = workoutService.applyWorkoutPlan(request.workoutId(), request.workoutName(), workoutExercises, auth);
        return ResponseEntity.ok(new ApplyWorkoutPlanResponse(saved, skippedExercises));
    }

}
