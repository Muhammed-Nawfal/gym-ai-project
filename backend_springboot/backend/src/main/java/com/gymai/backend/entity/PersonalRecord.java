package com.gymai.backend.entity;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "personal_record")
public class PersonalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) 
    private User user;

    @ManyToOne
    @JoinColumn(name = "exercise_id", nullable = false)  
    private Exercise exercise;

    @Column(name = "max_weight")
    private Double maxWeight;

    @Column(name = "reps")
    private Integer reps;

    @Column(name = "achieved_on")
    private LocalDate achievedOn;
}
