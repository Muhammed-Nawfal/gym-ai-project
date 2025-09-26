package com.gymai.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gymai.backend.entity.Achievements;
import com.gymai.backend.repository.AchievementsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AchievementsService {

    private final AchievementsRepository achievementsRepository;

    public List<Achievements> getAchievementsByUserId(Long userId){
        return achievementsRepository.findByUserId(userId);
    }

    public List<Achievements> getAchievemtsByUserIdAndDate(Long userId, LocalDate date){
        return achievementsRepository.findByUserIdAndDateEarned(userId, date);
    }

    public Achievements getAchievementsByName(String name){
        return achievementsRepository.findByTitle(name).orElseThrow();
    }


    
}
