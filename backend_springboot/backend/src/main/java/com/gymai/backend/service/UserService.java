package com.gymai.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.gymai.backend.dto.UserResponse;
import com.gymai.backend.entity.User;
import com.gymai.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse toUserResponse(User u) {
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
        r.setSkillLevel(u.getSkillLevel());
        r.setCreatedAt(u.getCreatedAt());
        r.setUpdatedAt(u.getUpdatedAt());
        return r;
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

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow();
    }

    public User getUserByUserName(String userName) {
        return userRepository.findByUserName(userName)
            .orElseThrow(() -> new UsernameNotFoundException("Unable to find user"));
    } 

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Unable to find user"));
    } 

    public User updateUser(String email, User updatedUser) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Unable to find user"));

        // Apply only fields allowed to change
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setHeight(updatedUser.getHeight());
        user.setWeight(updatedUser.getWeight());
        user.setGoalWeight(updatedUser.getGoalWeight());
        user.setDob(updatedUser.getDob());
        user.setProfilePictureUrl(updatedUser.getProfilePictureUrl());
        user.setSkillLevel(updatedUser.getSkillLevel());
        user.setUserGoal(updatedUser.getUserGoal());

        user.setUpdatedAt(java.time.LocalDateTime.now());

        return userRepository.save(user);
    }

    public String saveProfilePicture(MultipartFile file, String userEmail) {
        try{
            String uploadDir = "uploads/profile-pictures/";
            Path uploadPath = Paths.get(uploadDir);

            if(!Files.exists(uploadPath)){
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if(originalFileName != null && originalFileName.contains(".")){
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(),filePath, StandardCopyOption.REPLACE_EXISTING);

            String fileurl = "/uploads/profile-pictures/" + fileName;

            User user =  getUserByEmail(userEmail);

            if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isEmpty()) {
                deleteOldProfilePicture(user.getProfilePictureUrl());
            }

            user.setProfilePictureUrl(fileurl);
            userRepository.save(user);

            return fileurl;
        }

        catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    private void deleteOldProfilePicture(String oldurl){
        try{
            Path oldFilePath = Paths.get(oldurl);
            Files.deleteIfExists(oldFilePath);
        }
         catch (IOException e) {
            System.err.println("Failed to delete old profile picture: " + e.getMessage());
        }
    }

    
}
