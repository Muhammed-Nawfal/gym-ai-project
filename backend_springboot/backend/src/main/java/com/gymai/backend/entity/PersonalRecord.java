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
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Exercise exercise;

    private Double maxWeight;
    private Integer reps;
    private LocalDate achievedOn;
}
