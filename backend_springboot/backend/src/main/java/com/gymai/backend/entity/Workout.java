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
    private Long id;

    @Column(nullable=false)
    private String name;

    @ManyToOne(optional = false)
    private User user;

    @ManyToMany
    @JoinTable(
        name="workout_exercises",
        joinColumns = @JoinColumn(name = "workout_id"),
        inverseJoinColumns = @JoinColumn(name = "exercise_id")
    )
    private List<Exercise> exercises = new ArrayList<>(); 
}
