package com.gymai.backend.dto;

import java.time.LocalDate;

import com.gymai.backend.enums.Goal;
import com.gymai.backend.enums.SkillLevel;

import jakarta.validation.constraints.*;

public class RegisterRequest {

    @NotBlank @Size(max = 50)
    private String firstName;

    @NotBlank @Size(max = 50)
    private String lastName;

    @NotBlank
    @Size(min = 5, max = 20)
    @Pattern(
        regexp = "^[a-zA-Z0-9._-]+$",
        message = "Username contains unacceptable characters. Please provide another user name"
    )
    private String userName;

    @NotBlank
    @Email
    @Size(max=255)
    private String email;
    
    @NotBlank
    @Size(min = 8,max = 60, message="Password must be at least 8 characters")
    private String password;

    @Min(60) @Max(250)
    private int height; // cm

    @Min(20) @Max(400)
    private int weight; // kg

    @Min(20) @Max(400)
    private int goalWeight; // kg

    @NotNull
    private Goal userGoal;

    @NotNull
    private SkillLevel skillLevel;

    private LocalDate dob;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }

    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }

    public int getGoalWeight() { return goalWeight; }
    public void setGoalWeight(int goalWeight) { this.goalWeight = goalWeight; }

    public Goal getUserGoal() { return userGoal; }
    public void setUserGoal(Goal userGoal) { this.userGoal = userGoal; }

    public SkillLevel getSkillLevel() { return skillLevel;}
    public void setSkillLevel(SkillLevel skillLevel) {this.skillLevel = skillLevel;}

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
}
