package com.gymai.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "workout_entry")
public class WorkoutEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id") 
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "workout_id")
    private Workout workout;
}
