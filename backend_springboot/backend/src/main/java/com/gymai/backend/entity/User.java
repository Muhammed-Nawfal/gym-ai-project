package com.gymai.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.gymai.backend.enums.Goal;

import jakarta.persistence.*;

@Entity
@Table(name = "users") // Maps this class to the "users" table in Postgres

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String userName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordString;

    @Column
    private String profilePictureUrl;

    @Column(nullable = false)
    private int height;

    @Column(nullable = false)
    private int weight;

    @Column(nullable = false)
    private int goalWeight;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Goal userGoal;

    @Column
    private LocalDate dob;


    public long getId() { return id;}
    public void setId(Long id) {this.id = id;}

    public String getFirstName() { return firstName;}
    public void setFirstName(String firstName) {this.firstName = firstName;}

    public String getLastName() { return lastName;}
    public void setLastName(String lastName) {this.lastName = lastName;}

    public String getEmail() { return email;}
    public void setEmail(String email) {this.email = email;}

    public String getUserName() { return userName;}
    public void setUserName(String userName) {this.userName = userName;}

    public String getPasswordString() { return passwordString;}
    public void setPasswordString(String passwordString) {this.passwordString = passwordString;}

    public String getProfilePictureUrl() { return profilePictureUrl;}
    public void setProfilePictureUrl(String profilePictureUrl) {this.profilePictureUrl = profilePictureUrl;}

    public int getHeight() { return height;}
    public void setHeight(int height) {this.height = height;}

    public int getWeight() { return weight;}
    public void setWeight(int weight) {this.weight = weight;}

    public int getGoalWeight() { return goalWeight;}
    public void setGoalWeight(int goalWeight) {this.goalWeight = goalWeight;}

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public Goal getUserGoals() {return userGoal;}
    public void setUserGoal(Goal userGoal) {this.userGoal = userGoal;}
}
