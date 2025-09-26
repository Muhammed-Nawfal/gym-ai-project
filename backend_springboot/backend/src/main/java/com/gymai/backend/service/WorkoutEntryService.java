package com.gymai.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gymai.backend.entity.WorkoutEntry;
import com.gymai.backend.repository.WorkoutEntryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WorkoutEntryService {

    private final WorkoutEntryRepository workoutEntryRepository;

    public WorkoutEntry addWorkoutEntry(WorkoutEntry we){
        return workoutEntryRepository.save(we);
    }

    public List<WorkoutEntry> getWorkoutEntriesForUser(Long userID){
        return workoutEntryRepository.findByUserId(userID);
    }

    public List<WorkoutEntry> getWorkoutEntriesWithDate(Long userId, LocalDate date){
        return workoutEntryRepository.findByUserIdAndPerformedDate(userId, date);    
    }
    
}
