package com.gymai.backend.dto;

import java.time.LocalDateTime;

import com.gymai.backend.enums.ChatRole;

public record ChatMessageDto(
    Long id,
    ChatRole role,
    String content,
    Object proposedWorkoutPlan,
    Boolean planApplied,
    Object resolvableInsight,
    Boolean insightResolved,
    LocalDateTime createdAt
) {}