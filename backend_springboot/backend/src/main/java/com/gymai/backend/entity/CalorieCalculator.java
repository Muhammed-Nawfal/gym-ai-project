/*
 * Needs to reconsider having this later
 * 
 * Needs to reconsider having this later
 * 
 * 
 * Needs to reconsider having this later
 */




package com.gymai.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "calorie_calculator")
public class CalorieCalculator {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;
    
}
