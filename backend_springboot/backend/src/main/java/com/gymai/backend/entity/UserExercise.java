package com.gymai.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "user_exercise")
public class UserExercise{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private Exercise exercise;

    private Integer lastSets;
    private Integer lastReps;   
    private Double lastWeight;
}