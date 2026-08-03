package com.gymai.backend.agent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.adk.agents.LlmAgent;
import com.google.adk.events.Event;
import com.google.adk.models.Gemini;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.Session;
import com.google.adk.tools.Annotations.Schema;
import com.google.adk.tools.FunctionTool;
import com.google.adk.tools.ToolContext;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import com.gymai.backend.dto.PersonalRecordDto;
import com.gymai.backend.dto.WorkoutHistoryDto;
import com.gymai.backend.service.PersonalRecordService;
import com.gymai.backend.service.WorkoutSessionService;

import io.reactivex.rxjava3.core.Flowable;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GymAgentService {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    @Value("${LINKUP_API_KEY}")
    private String linkupApiKey;

    @Autowired
    private WorkoutSessionService workoutSessionService;
    
    @Autowired
    private PersonalRecordService personalRecordService;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private InMemoryRunner runner;

    @PostConstruct
    private void init() {
        Client client = Client.builder().vertexAI(false).apiKey(apiKey).build();

        FunctionTool searchTool = FunctionTool.create(this, "searchWeb");
        FunctionTool workoutHistoryTool = FunctionTool.create(this, "getWorkoutHistory");
        FunctionTool personalRecordsTool = FunctionTool.create(this, "getPersonalRecords");

        LlmAgent agent = LlmAgent.builder()
                .name("gym-assistant")
                .description("A world class fitness assistant")
                .instruction("""
                    You are a world-class fitness assistant, helping users with questions about
                    their workouts, exercises, progress, diet, and injuries.

                    Stay strictly within fitness, training, diet, exercise form, recovery, and
                    injury topics. If asked about anything else, politely explain that you can
                    only help with gym and injury-related topics.

                    Base your answers on the user's actual logged workout data and progress
                    when available, rather than generic advice. Ask a clarifying question first
                    if the request is too vague to answer usefully.

                    For injuries specifically: give general, safe guidance only — never diagnose
                    a condition or declare what's wrong with someone. Always recommend the user
                    consult a GP or physiotherapist for anything beyond minor, obvious soreness.
                    Offer advice, not verdicts.

                    When you give exercise recommendations, be specific and actionable (exercises,
                    sets, reps, and modifications for injuries or limitations), and briefly explain
                    the reasoning behind them.

                    Use the searchWeb tool when a question needs current research, statistics, or
                    facts you're not certain about. Only cite sources when you've actually used
                    searchWeb to look something up — never invent references.
                """)
                .model(new Gemini("gemini-3.5-flash", client))
                .tools(searchTool, workoutHistoryTool, personalRecordsTool)
                .build();
        runner = new InMemoryRunner(agent);
    }

    @Schema(description = "Searches the web for current, factual information to back up fitness, "
            + "nutrition, training, or injury-related advice. Use this when the question needs "
            + "recent research, statistics, or facts you're not confident about.")
    public Map<String, Object> searchWeb(@Schema(description = "The search query", name = "query") String query) {
        try {
            String requestBody = objectMapper.writeValueAsString(Map.of(
                    "q", query,
                    "depth", "standard",
                    "outputType", "sourcedAnswer"
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.linkup.so/v1/search"))
                    .header("Authorization", "Bearer " + linkupApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode root = objectMapper.readTree(response.body());
            String answer = root.path("answer").asText("");

            List<Map<String, String>> sources = new ArrayList<>();
            for (JsonNode source : root.path("sources")) {
                sources.add(Map.of(
                        "name", source.path("name").asText(""),
                        "url", source.path("url").asText("")
                ));
            }

            return Map.of("answer", answer, "sources", sources);
        } catch (Exception e) {
            return Map.of("error", "Search failed: " + e.getMessage());
        }
    }

    @Schema(description = "Retrieves the user's recent workout history: workout names, dates, "
            + "total sets, and total volume lifted per session. Use this to answer questions "
            + "about what the user has actually trained recently or how consistent they've been.")
    public Map<String, Object> getWorkoutHistory(@Schema(name= "toolContext") ToolContext toolContext){

        Long userId = Long.valueOf((String) toolContext.state().get("userId"));

        List<WorkoutHistoryDto> history = workoutSessionService.getWorkoutHistoryForUser(userId);
        List<Map<String, Object>> summarised = new ArrayList<>();
        for(WorkoutHistoryDto entry : history){
            Map<String, Object> entryMap = new HashMap<>();
            entryMap.put("workoutName", entry.workoutName());
            entryMap.put("completedAt", entry.completedAt());
            entryMap.put("totalSets", entry.totalSets());
            entryMap.put("totalVolume", entry.totalVolume());
            summarised.add(entryMap);
        }

        return Map.of("workoutHistory", summarised);
    }

    @Schema(description = "Retrieves the user's current personal records — the heaviest weight "
            + "lifted for each exercise. Use this to answer questions about the user's strength "
            + "levels, best lifts, or progress on specific exercises.")
    public Map<String, Object> getPersonalRecords(@Schema(name= "toolContext") ToolContext toolContext){

        Long userId = Long.valueOf((String) toolContext.state().get("userId"));

        List<PersonalRecordDto> history = personalRecordService.getPersonalRecordsForUser(userId);
        List<Map<String, Object>> summarised = new ArrayList<>();
        for(PersonalRecordDto entry : history){
            Map<String, Object> entryMap = new HashMap<>();
            entryMap.put("exerciseName", entry.exerciseName());
            entryMap.put("recordWeight", entry.weight());
            entryMap.put("recordReps", entry.reps());
            entryMap.put("recordVolume", entry.volume());
            entryMap.put("achievedAt", entry.achievedAt());
            entryMap.put("workoutName", entry.workoutName());
            summarised.add(entryMap);
        }

        return Map.of("personalRecords", summarised);
    }

    public String chat(String userId, String message) {
        Map<String, Object> initialState = Map.of("userId", userId);
        Session session = runner.sessionService().createSession(runner.appName(), userId, initialState, null).blockingGet();

        Content userMsg = Content.fromParts(Part.fromText(message));
        Flowable<Event> events = runner.runAsync(session.userId(), session.id(), userMsg);

        StringBuilder reply = new StringBuilder();
        events.blockingForEach(event -> {
            if(event.finalResponse())
                reply.append(event.stringifyContent());
        });

        return reply.toString();
    }

}
