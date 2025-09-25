package com.gymai.backend.repository;

import java.util.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gymai.backend.entity.User;
import com.gymai.backend.entity.UserExercise;

@Repository
public interface UserExerciseRepository extends JpaRepository<UserExercise, Long>{
    
    Optional<UserExercise> findByUserIdAndExerciseId(Long userId, Long exerciseId);
    List<UserExercise> findByUser(User user);
}
