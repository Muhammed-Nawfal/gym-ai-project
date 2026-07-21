package com.gymai.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "personal_record_history")
public class PersonalRecordHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(name = "weight", nullable = false)
    private Double weight;

    @Column(name = "reps", nullable = false)
    private Integer reps;

    @ManyToOne
    @JoinColumn(name = "workout_entry_id")
    private WorkoutEntry workoutEntry;

    @Column(name = "achieved_at", nullable = false)
    private LocalDateTime achievedAt;
}