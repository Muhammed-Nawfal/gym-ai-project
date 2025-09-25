package com.gymai.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.gymai.backend.entity.WorkoutEntry;
import com.gymai.backend.service.WorkoutEntryService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/api/workout-entry")
@RequiredArgsConstructor
public class WorkoutEntryController {

    private WorkoutEntryService workoutEntryService;

    @PostMapping("/add")
    public ResponseEntity<WorkoutEntry> addWorkoutEntry(@RequestBody WorkoutEntry we){
        return ResponseEntity.ok(workoutEntryService.addWorkoutEntry(we));
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<WorkoutEntry>> getWorkoutEntriesForUser(@PathVariable Long userID){
        return ResponseEntity.ok(workoutEntryService.getWorkoutEntriesForUser(userID));
    }

    @GetMapping
    public ResponseEntity<List<WorkoutEntry>> getWorkoutEntriesWithDate(
        @RequestParam Long userId, 
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date){
        return ResponseEntity.ok(workoutEntryService.getWorkoutEntriesWithDate(userId, date));
    }
    
}
