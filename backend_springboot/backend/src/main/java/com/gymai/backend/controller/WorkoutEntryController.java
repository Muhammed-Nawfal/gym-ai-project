package com.gymai.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gymai.backend.entity.User;
import com.gymai.backend.entity.WorkoutEntry;
import com.gymai.backend.service.WorkoutEntryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/workout-entry")
@RequiredArgsConstructor
public class WorkoutEntryController {

    private final WorkoutEntryService workoutEntryService;

    @PostMapping("/add")
    public ResponseEntity<WorkoutEntry> addWorkoutEntry(@RequestBody WorkoutEntry we){
        return ResponseEntity.ok(workoutEntryService.addWorkoutEntry(we));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkoutEntry>> getWorkoutEntries(
        @PathVariable Long userId,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate date
    ) {
        if (date != null) {
            return ResponseEntity.ok(workoutEntryService.getWorkoutEntriesWithDate(userId, date));
        }
        return ResponseEntity.ok(workoutEntryService.getWorkoutEntriesForUser(userId));
    }

    @GetMapping("/count/{userId}")
    public long getWorkoutCount(@PathVariable Long userId) {
        return workoutEntryService.getWorkoutCountForUserId(userId);
    }

    
}
