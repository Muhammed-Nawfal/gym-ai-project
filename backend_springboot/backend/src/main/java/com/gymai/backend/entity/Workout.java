package com.gymai.backend.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "workout")
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable=false)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(
        mappedBy = "workout", 
        cascade = CascadeType.ALL, 
        orphanRemoval = true
    )
    @OrderBy("orderIndex ASC")
    private List<WorkoutExercise> workoutExercises = new ArrayList<>();

    @Column(name = "is_predefined")
    private Boolean isPredefined = false;

    @ElementCollection(targetClass = MuscleGroup.class)
    @CollectionTable(name = "workout_muscle_groups", joinColumns = @JoinColumn(name = "workout_id"))
    @Enumerated(EnumType.STRING) // store as text instead of numbers
    @Column(name = "muscle_group")
    private List<MuscleGroup> muscleGroups = new ArrayList<>();

    @Column(name = "description")
    private String description;
}
