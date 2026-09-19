package com.gymai.backend.entity;

import java.time.LocalDateTime;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "coach_insight")
public class CoachInsight {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        Long id;

        @ManyToOne(optional = false)
        @JoinColumn(name = "user_id")
        User user;

        @ManyToOne
        @JoinColumn(name = "exercise_id")
        Exercise exercise;

        @Column(name = "message")
        String message;

        @Column(name = "created_at")
        LocalDateTime createdAt;

        @Column(name = "resolved")
        Boolean resolved = false;
}
