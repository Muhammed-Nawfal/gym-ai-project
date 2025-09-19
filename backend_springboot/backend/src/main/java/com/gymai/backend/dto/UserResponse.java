package com.gymai.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.gymai.backend.enums.Goal;
import com.gymai.backend.enums.SkillLevel;

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

    public Long getId() { return id;}
    public void setId(Long id) {this.id=id;}

    public String getFirstName() {return firstName;}
    public void setFirstName(String firstName) {this.firstName = firstName;}

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }

    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }

    public int getGoalWeight() { return goalWeight; }
    public void setGoalWeight(int goalWeight) { this.goalWeight = goalWeight; }

    public Goal getUserGoal() { return userGoal; }
    public void setUserGoal(Goal userGoal) { this.userGoal = userGoal; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public SkillLevel getSkillLevel() { return skillLevel;}
    public void setSkillLevel(SkillLevel skillLevel) {this.skillLevel = skillLevel;}

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
}
