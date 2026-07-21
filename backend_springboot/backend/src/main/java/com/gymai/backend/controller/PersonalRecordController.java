package com.gymai.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymai.backend.dto.PersonalRecordDto;
import com.gymai.backend.dto.PersonalRecordHistoryDto;
import com.gymai.backend.service.PersonalRecordService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/personal-records")
@RequiredArgsConstructor
public class PersonalRecordController {

    private final PersonalRecordService personalRecordService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PersonalRecordDto>> getPersonalRecords(@PathVariable Long userId) {
        return ResponseEntity.ok(personalRecordService.getPersonalRecordsForUser(userId));
    }

    @GetMapping("/user/{userId}/exercise/{exerciseId}/history")
    public ResponseEntity<List<PersonalRecordHistoryDto>> getPersonalRecordHistory(
        @PathVariable Long userId, @PathVariable Long exerciseId
    ) {
        return ResponseEntity.ok(personalRecordService.getHistoryForExercise(userId, exerciseId));
    }
}