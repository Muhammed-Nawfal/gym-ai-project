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
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_muscle_group", nullable = false)
    private MuscleGroup primaryMuscleGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "secondary_muscle_group")
    private MuscleGroup secondaryMuscleGroup;

    @Enumerated(EnumType.STRING)
    @Column(name = "tertiary_muscle_group")
    private MuscleGroup tertiaryMuscleGroup;

    @Column(name = "description")
    private String description;

    @Column(name = "youtube_link")
    private String youtubeLink;

    @ManyToOne
    @JoinColumn(name = "created_by", nullable = true)
    private User createdBy;
    
}
