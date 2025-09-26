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
    @Column(name = "id")
    private Long id;

    @Column(name = "performed_date")
    private LocalDate performedDate;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id") 
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "workout_id")
    private Workout workout; 
    
}
