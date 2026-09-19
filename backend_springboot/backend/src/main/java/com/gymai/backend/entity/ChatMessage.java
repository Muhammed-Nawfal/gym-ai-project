package com.gymai.backend.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.gymai.backend.enums.ChatRole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@Table(name = "chat_message")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "chat_id")
    @JsonIgnore
    private Chat chat;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private ChatRole role;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "proposed_workout_plan", columnDefinition = "TEXT")
    private String proposedWorkoutPlanJson;

    @Column(name = "plan_applied", nullable = false)
    private Boolean planApplied = false;

    @Column(name = "resolvable_insight", columnDefinition = "TEXT")
    private String resolvableInsightJson;

    @Column(name = "insight_resolved", nullable = false)
    private Boolean insightResolved = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}