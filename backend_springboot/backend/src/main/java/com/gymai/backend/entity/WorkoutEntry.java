package com.gymai.backend.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "workout_entry")
public class WorkoutEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate performedDate;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private Workout workout; 
    
}
