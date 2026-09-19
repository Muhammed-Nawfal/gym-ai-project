package com.gymai.backend.dto;

import java.time.LocalDateTime;

public record ChatSummaryDto(Long id, String title, LocalDateTime createdAt, LocalDateTime updatedAt) {}