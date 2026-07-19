package com.gymai.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.gymai.backend.entity.Achievements;
import com.gymai.backend.service.AchievementsService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/api/achievements")
@RequiredArgsConstructor
public class AchievementsController {

    private final AchievementsService achievementsService;

    public ResponseEntity<List<Achievements>> getAchievementsByUserId(Long userId){
        return ResponseEntity.ok(achievementsService.getAchievementsByUserId(userId));
    }

    public ResponseEntity<List<Achievements>> getAchievemtsByUserIdAndDate(Long userId, LocalDate date){
        return ResponseEntity.ok(achievementsService.getAchievemtsByUserIdAndDate(userId, date));
    }

    public ResponseEntity<Achievements> getAchievementsByName(String name){
        return ResponseEntity.ok(achievementsService.getAchievementsByName(name));
    }
    
}
