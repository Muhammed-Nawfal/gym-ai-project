package com.gymai.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gymai.backend.enums.*;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users") // Maps this class to the "users" table in Postgres
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name",nullable = false)
    private String lastName;

    @Column(name = "user_name", nullable = false, unique = true)
    private String userName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    /**
     * Store a one-way hash (e.g., BCrypt). Never the raw password.
     * 60 chars fits BCrypt hashes.
     * @JsonIgnore prevents this field from being serialized in API responses.
     */
    @JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 60)
    private String passwordHash;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "height",nullable = false)
    private int height;

    @Column(name = "weight", nullable = false)
    private int weight;

    @Column(name = "goal_weight", nullable = false)
    private int goalWeight;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_goal", nullable = false)
    private Goal userGoal;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level", nullable = false)
    private SkillLevel skillLevel;

    @Column(name = "dob")
    private LocalDate dob;
}
