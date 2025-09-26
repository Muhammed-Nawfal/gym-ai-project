package com.gymai.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.Achievements;

@Repository
public interface AchievementsRepository extends JpaRepository<Achievements,Long> {

    List<Achievements> findByUserId(Long userId);

    List<Achievements> findByUserIdAndDateEarned(Long userId, LocalDate date);

    Optional<Achievements> findByTitle(String title);

    
} 
