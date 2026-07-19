package com.gymai.backend.service;

import com.gymai.backend.dto.AuthResponse;
import com.gymai.backend.dto.LoginRequest;
import com.gymai.backend.dto.RegisterRequest;
import com.gymai.backend.dto.UserResponse;
import com.gymai.backend.entity.User;
import com.gymai.backend.repository.UserRepository;
import com.gymai.backend.security.JwtUtils;

import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;


@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req){

        String email = req.getEmail().trim().toLowerCase();
        String userName = req.getUserName().trim();

        if(userRepository.findByEmail(email).isPresent()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }

        if(userRepository.findByUserName(userName).isPresent()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already in use");
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

            String token = jwtUtils.generateToken(saved.getEmail());
            return new AuthResponse(token, saved.getEmail());
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

    public AuthResponse login(LoginRequest request){

        String identifier = request.getEmail().trim();

        User user = userRepository.findByEmail(identifier)
            .orElseGet(() -> userRepository.findByUserName(identifier)
            .orElseThrow(() -> new RuntimeException("User not found")));

        if(!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())){
            throw new RuntimeException("Username or password incorrect");
        }

        String token = jwtUtils.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail());

    }
    
}
