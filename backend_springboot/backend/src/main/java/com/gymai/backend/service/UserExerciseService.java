package com.gymai.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.gymai.backend.entity.UserExercise;
import com.gymai.backend.entity.Exercise;
import com.gymai.backend.entity.User;
import com.gymai.backend.repository.ExerciseRepository;
import com.gymai.backend.repository.UserExerciseRepository;
import com.gymai.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserExerciseService {
    
    private final UserExerciseRepository userExerciseRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    public List<UserExercise> getUserExercises(Long userId){
        User user = userRepository.findById(userId).orElseThrow();
        return userExerciseRepository.findByUser(user);
    }

    public UserExercise getUserExerciseDetails(Long userId, Long exerciseId){


        return userExerciseRepository.findByUserIdAndExerciseId(userId, exerciseId)
        .orElseThrow(() -> new RuntimeException("No history yet for this exercise"));
    }

    public UserExercise updatesSetsAndReps(UserExercise usx){
        User user = userRepository.findById(usx.getUser().getId()).orElseThrow();
        Exercise ex = exerciseRepository.findById(usx.getExercise().getId()).orElseThrow();

        UserExercise ue = userExerciseRepository.findByUserIdAndExerciseId(user.getId(), ex.getId())
            .orElse(new UserExercise());

        ue.setUser(user);
        ue.setExercise(ex);
        ue.setLastReps(usx.getLastReps());
        ue.setLastSets(usx.getLastSets());
        ue.setLastWeight(usx.getLastWeight());

        return userExerciseRepository.save(ue);
    }


}
