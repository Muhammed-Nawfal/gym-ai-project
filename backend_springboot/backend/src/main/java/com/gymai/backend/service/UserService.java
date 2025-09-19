package com.gymai.backend.service;

import java.util.*;

import org.springframework.stereotype.Service;

import com.gymai.backend.entity.User;
import com.gymai.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User registerUser(User user){

        if(userRepository.findByUserName(user.getUserName()).isPresent()){
            throw new IllegalArgumentException("Username already exists");
        }
        if(userRepository.findByEmail(user.getEmail()).isPresent()){
            throw new IllegalArgumentException("Email already exists. Log in with your existing account");
        }
        
        //TODO: Password hasing
        return userRepository.save(user);
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
}
