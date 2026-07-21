package com.gymai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymai.backend.dto.AddExerciseToSessionRequest;
import com.gymai.backend.dto.SessionExerciseDto;
import com.gymai.backend.dto.SessionSetDto;
import com.gymai.backend.dto.StartWorkoutRequest;
import com.gymai.backend.dto.StartWorkoutResponse;
import com.gymai.backend.dto.UpdateSessionExerciseRequest;
import com.gymai.backend.dto.UpdateSetRequest;
import com.gymai.backend.service.WorkoutSessionService;

import lombok.RequiredArgsConstructor;
import com.gymai.backend.dto.WorkoutHistoryDto;

@RestController
@RequestMapping("/api/workout-sessions")
@RequiredArgsConstructor
public class WorkoutSessionController {

    private final WorkoutSessionService workoutSessionService;

    @PostMapping("/start")
    public ResponseEntity<StartWorkoutResponse> startWorkoutSession(@RequestBody StartWorkoutRequest request) {
        return ResponseEntity.ok(workoutSessionService.startWorkout(request));
    }

    @PostMapping("/{workoutEntryId}/add-exercise")
    public ResponseEntity<SessionExerciseDto> addExerciseToSession(@PathVariable Long workoutEntryId, @RequestBody AddExerciseToSessionRequest ex) {
        return ResponseEntity.ok(workoutSessionService.addExerciseToSession(workoutEntryId, ex));
    }

    @PostMapping("/{workoutEntryExerciseId}/add-set")
    public ResponseEntity<SessionSetDto> addSetToExerciseInSession(@PathVariable Long workoutEntryExerciseId) {
        return ResponseEntity.ok(workoutSessionService.addSetToExistingExercise(workoutEntryExerciseId));
    }

    @PutMapping("/{setId}/update-set")
    public ResponseEntity<SessionSetDto> updateSetInSession(@PathVariable Long setId, @RequestBody UpdateSetRequest request) {
        return ResponseEntity.ok(workoutSessionService.updateSet(setId, request));
    }

    @DeleteMapping("/{setId}/delete-set")
    public ResponseEntity<Void> deleteSetFromExercise(@PathVariable Long setId) {
        workoutSessionService.deleteSet(setId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{workoutEntryId}/finish-workout")
    public ResponseEntity<Void> finishWorkoutSession(@PathVariable Long workoutEntryId) {
        workoutSessionService.finishWorkoutSession(workoutEntryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{workoutEntryId}")
    public ResponseEntity<StartWorkoutResponse> getWorkoutSession(@PathVariable Long workoutEntryId){
        return ResponseEntity.ok(workoutSessionService.getSession(workoutEntryId));
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<StartWorkoutResponse> getOngoingWorkoutSession(@PathVariable Long userId){
        return ResponseEntity.ok(workoutSessionService.getCurrentActiveSessionForUser(userId));
    }

    @PutMapping("/exercises/{workoutEntryExerciseId}")
    public ResponseEntity<SessionExerciseDto> updateSessionExercise(
        @PathVariable Long workoutEntryExerciseId,
        @RequestBody UpdateSessionExerciseRequest request
    ) {
        return ResponseEntity.ok(workoutSessionService.updateSessionExercise(workoutEntryExerciseId, request));
    }

    @DeleteMapping("/{workoutEntryId}/discard")
    public ResponseEntity<Void> discardWorkoutSession(@PathVariable Long workoutEntryId) {
        workoutSessionService.discardWorkoutSession(workoutEntryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}/history")
    public ResponseEntity<List<WorkoutHistoryDto>> getWorkoutHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(workoutSessionService.getWorkoutHistoryForUser(userId));
    }

    @DeleteMapping("/{workoutEntryId}/history")
    public ResponseEntity<Void> deleteWorkoutHistoryEntry(@PathVariable Long workoutEntryId) {
        workoutSessionService.deleteWorkoutHistoryEntry(workoutEntryId);
        return ResponseEntity.noContent().build();
    }

}