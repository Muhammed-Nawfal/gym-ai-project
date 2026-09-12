package com.gymai.backend.controller;

import com.gymai.backend.dto.CoachInsightDto;
import com.gymai.backend.entity.CoachInsight;
import com.gymai.backend.entity.User;
import com.gymai.backend.repository.CoachInsightRepository;
import com.gymai.backend.repository.UserRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/insights")
public class ProgressInsightsController {

    private final CoachInsightRepository coachInsightRepository;
    private final UserRepository userRepository;

    public ProgressInsightsController(CoachInsightRepository coachInsightRepository, UserRepository userRepository) {
        this.coachInsightRepository = coachInsightRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<CoachInsightDto> getInsights() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return coachInsightRepository.findByUserIdAndResolvedFalse(user.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    private CoachInsightDto toDto(CoachInsight insight) {
        return new CoachInsightDto(
                insight.getId(),
                insight.getExercise() != null ? insight.getExercise().getName() : null,
                insight.getMessage(),
                insight.getCreatedAt(),
                insight.getResolved()
        );
    }
}