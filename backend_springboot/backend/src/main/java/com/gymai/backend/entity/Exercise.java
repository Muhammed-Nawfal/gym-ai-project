package com.gymai.backend.entity;

import java.util.ArrayList;
import java.util.List;

import com.gymai.backend.enums.MuscleGroup;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "exercise")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    //this will create a new table with excercise id and muscle group
    @ElementCollection(targetClass = MuscleGroup.class)
    @CollectionTable(name = "exercise_muscle_groups", joinColumns = @JoinColumn(name = "exercise_id"))
    @Enumerated(EnumType.STRING) // store as text instead of numbers
    @Column(name = "muscle_group")
    private List<MuscleGroup> muscleGroups = new ArrayList<>();


    private String description;
    private String youtubeLink;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = true)
    private User createdBy;
    
}
