package com.gymai.backend.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "workout_entry_exercise")
public class WorkoutEntryExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "workout_entry_id")
    private WorkoutEntry workoutEntry;

    @ManyToOne(optional = false)
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Column(name = "target_sets")
    private Integer targetSets;

    @Column(name = "target_reps")
    private Integer targetReps;

    @Column(name = "rest_seconds")
    private Integer restSeconds;

    @OneToMany(mappedBy = "workoutEntryExercise", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("setIndex ASC")
    private List<WorkoutEntrySet> sets = new ArrayList<>();
}
