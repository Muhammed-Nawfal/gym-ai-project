package com.gymai.backend.controller;


import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymai.backend.dto.AuthResponse;
import com.gymai.backend.dto.LoginRequest;
import com.gymai.backend.dto.RegisterRequest;
import com.gymai.backend.repository.UserRepository;
import com.gymai.backend.security.JwtUtils;
import com.gymai.backend.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

        @PostMapping("/register")
        public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request){
            AuthResponse created = authService.register(request);

            return ResponseEntity.ok(created);
        }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/check-availability")
    public ResponseEntity<Map<String,Boolean>> checkAvailability(
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String userName
    ) {
        Map<String, Boolean> availability = new HashMap<>();

        if(email != null && !email.isEmpty()){
            availability.put("emailAvailable", 
                !userRepository.findByEmail(email.trim().toLowerCase()).isPresent());
        }

        if(userName != null && !userName.isEmpty()){
            availability.put("usernameAvailable", 
                !userRepository.findByUserName(userName.trim()).isPresent()
            );
        }

        return ResponseEntity.ok(availability);
    }
}
