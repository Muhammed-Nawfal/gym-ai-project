package com.gymai.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.gymai.backend.enums.Goal;
import com.gymai.backend.enums.SkillLevel;

import lombok.Data;

@Data
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String userName;
    private String email;
    private String profilePictureUrl;
    private int height;
    private int weight;
    private int goalWeight;
    private Goal userGoal;
    private SkillLevel skillLevel;
    private LocalDate dob;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
}
