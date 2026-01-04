package com.gymai.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "user_exercise")
public class UserExercise{

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

    @Column(name = "last_sets")
    private Integer lastSets;

    @Column(name = "last_reps")
    private Integer lastReps;   

    @Column(name = "last_weight")
    private Double lastWeight;

    @ManyToOne
    @JoinColumn(name = "last_workout_entry_exercise_id")
    private WorkoutEntryExercise lastWorkoutEntryExercise;

    @Column(name = "last_performed_at")
    private LocalDateTime lastPerformedAt;
}
