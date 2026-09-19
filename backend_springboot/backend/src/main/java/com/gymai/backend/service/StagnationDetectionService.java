package com.gymai.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.google.adk.events.Event;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.Session;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import com.gymai.backend.entity.CoachInsight;
import com.gymai.backend.entity.Exercise;
import com.gymai.backend.entity.User;
import com.gymai.backend.repository.CoachInsightRepository;
import com.gymai.backend.repository.ExerciseRepository;
import com.gymai.backend.repository.UserRepository;

import io.reactivex.rxjava3.core.Flowable;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StagnationDetectionService {

    private final UserRepository userRepository;
    private final GymAgentService gymAgentService;
    private final CoachInsightRepository coachInsightRepository;
    private final ExerciseRepository exerciseRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    private InMemoryRunner progressInsightRunner;

    @PostConstruct
    private void init() {
        progressInsightRunner = new InMemoryRunner(gymAgentService.getProgressInsightJsonAgent());
    }

    @Scheduled(cron = "0 0 4 * * *")
    public void detectStagnationForAllUsers() {
        List<User> users = userRepository.findAll();

        for (User user : users) {
            String userId = String.valueOf(user.getId());

            try {
                Map<String, Object> initialState = Map.of("userId", userId);
                Session session = progressInsightRunner.sessionService()
                    .createSession(progressInsightRunner.appName(), userId, initialState, null)
                    .blockingGet();

                String prompt = """
                    Check this user's logged workouts and exercises for stagnation using the hybrid rule from your
                    instructions. Respond ONLY with valid JSON, no other text and no markdown code fences,
                    in this exact shape:
                    [{"exerciseName": "...", "message": "..."}]
                    Return an empty array [] if nothing is stagnant.
                    """;

                Content userMsg = Content.fromParts(Part.fromText(prompt));
                Flowable<Event> events = progressInsightRunner.runAsync(session.userId(), session.id(), userMsg);

                StringBuilder replyBuilder = new StringBuilder();
                events.blockingForEach(event -> {
                    if(event.finalResponse())
                        replyBuilder.append(event.stringifyContent());
                });

                String reply = replyBuilder.toString();

                JsonNode findings = objectMapper.readTree(reply);

                for(JsonNode finding : findings) {
                    String exerciseName = finding.path("exerciseName").asText("");
                    String message = finding.path("message").asText("");


                    Optional<Exercise> exercise = exerciseRepository.findClosestByNameForUser(user.getId(), exerciseName);
                    if(exercise.isEmpty()) {
                        continue;
                    }

                    if(coachInsightRepository.existsByUserIdAndExerciseIdAndResolvedFalse(user.getId(), exercise.get().getId())){
                        continue;
                    }

                    CoachInsight insight = new CoachInsight();
                    insight.setUser(user);
                    insight.setExercise(exercise.get());
                    insight.setMessage(message);
                    insight.setResolved(false);
                    insight.setCreatedAt(LocalDateTime.now());
                    coachInsightRepository.save(insight);
                }
            } catch (Exception e) {
                System.err.println("Stagnation check failed for user " + userId + ": " + e.getMessage());
            }
        }
    }

}
