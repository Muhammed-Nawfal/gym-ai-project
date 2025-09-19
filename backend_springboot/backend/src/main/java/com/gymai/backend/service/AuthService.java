package com.gymai.backend.service;

import com.gymai.backend.dto.RegisterRequest;
import com.gymai.backend.dto.UserResponse;
import com.gymai.backend.entity.User;
import com.gymai.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest req){

        String email = req.getEmail().trim().toLowerCase();
        String userName = req.getUserName().trim();

        if(userRepository.findByEmail(email).isPresent()){
            throw new IllegalArgumentException("Email Already in use");
        }

        if(userRepository.findByUserName(userName).isPresent()){
            throw new IllegalArgumentException("Username already taken");
        }

        String hash = passwordEncoder.encode(req.getPassword());

        User u = new User();
        u.setFirstName(req.getFirstName().trim());
        u.setLastName(req.getLastName().trim());
        u.setUserName(userName);
        u.setEmail(email);
        u.setPasswordHash(hash); // store hash, not raw password
        u.setHeight(req.getHeight());
        u.setWeight(req.getWeight());
        u.setGoalWeight(req.getGoalWeight());
        u.setUserGoal(req.getUserGoal());
        u.setDob(req.getDob());
        u.setSkillLevel(req.getSkillLevel());

        try{
            User saved = userRepository.save(u);
            return toUserResponse(saved);
        }
        catch(DataIntegrityViolationException ex){
            throw new IllegalArgumentException("Email or username already exists");
        }
        
    }

    private UserResponse toUserResponse(User u){
        UserResponse r = new UserResponse();

        r.setId(u.getId());
        r.setFirstName(u.getFirstName());
        r.setLastName(u.getLastName());
        r.setUserName(u.getUserName());
        r.setEmail(u.getEmail());
        r.setProfilePictureUrl(u.getProfilePictureUrl());
        r.setHeight(u.getHeight());
        r.setWeight(u.getWeight());
        r.setGoalWeight(u.getGoalWeight());
        r.setUserGoal(u.getUserGoal());
        r.setDob(u.getDob());
        r.setCreatedAt(u.getCreatedAt());
        r.setUpdatedAt(u.getUpdatedAt());

        return r;
    }
    
}
