package com.gymai.backend.controller;

import java.net.Authenticator;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.gymai.backend.dto.UserResponse;
import com.gymai.backend.entity.User;
import com.gymai.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }
    

    //Get user by id
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id){
        User user = userService.getUserById(id);
        return ResponseEntity.ok(userService.toUserResponse(user));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication){
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(userService.toUserResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateCurrentUser(@RequestBody User updatedUser, Authentication authentication){
        String email = authentication.getName();     
        
        User saved = userService.updateUser(email, updatedUser); // updateUser should take updated data
        return ResponseEntity.ok(userService.toUserResponse(saved));
    }

    @PostMapping("/me/profile-picture")
    public ResponseEntity<UserResponse> uploadProfilePicture(
        @RequestParam("file") MultipartFile file,
        Authentication authentication
    ) {
        String email = authentication.getName();

        if(file.isEmpty()){
            return ResponseEntity.badRequest().build();
        }

        String contentType = file.getContentType();
        if(contentType == null || !contentType.startsWith("image/")){
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "File must be an image"

            );
        }

        if(file.getSize()> 5*1024*1024){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File size must be less than 5MB" );
        }

        String profilePictureUrl = userService.saveProfilePicture(file, email);

        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(userService.toUserResponse(user));
    }
                
}
