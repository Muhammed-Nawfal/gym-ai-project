package com.gymai.backend.controller;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymai.backend.dto.RegisterRequest;
import com.gymai.backend.dto.UserResponse;
import com.gymai.backend.service.AuthService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")

public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService= authService;
    }

        @PostMapping("/register")
        public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request){
            UserResponse created = authService.register(request);

            return ResponseEntity
                .created(URI.create("/api/users/"+created.getId()))
                .body(created);
        }
}
