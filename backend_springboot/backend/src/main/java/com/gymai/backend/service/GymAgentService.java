package com.gymai.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.adk.agents.LlmAgent;
import com.google.adk.events.Event;
import com.google.adk.models.Gemini;
import com.google.adk.runner.InMemoryRunner;
import com.google.adk.sessions.Session;
import com.google.adk.tools.Annotations.Schema;
import com.google.adk.tools.AgentTool;
import com.google.adk.tools.FunctionTool;
import com.google.adk.tools.ToolContext;
import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.Part;
import com.gymai.backend.agent.InjurySafetySpecialistAgent;
import com.gymai.backend.agent.ProgressInsightAgent;
import com.gymai.backend.agent.WorkoutPlanGeneratorAgent;
import com.gymai.backend.dto.PersonalRecordDto;
import com.gymai.backend.dto.PersonalRecordHistoryDto;
import com.gymai.backend.dto.PersonalRecordStatsDto;
import com.gymai.backend.dto.PreviousExercisePerformanceResponse;
import com.gymai.backend.dto.PreviousSetDto;
import com.gymai.backend.dto.ProposedExerciseDto;
import com.gymai.backend.dto.SessionExerciseDto;
import com.gymai.backend.dto.StartWorkoutResponse;
import com.gymai.backend.dto.WorkoutDetailDto;
import com.gymai.backend.dto.WorkoutHistoryDto;
import com.gymai.backend.dto.WorkoutListDto;
import com.gymai.backend.repository.ExerciseRepository;
import com.gymai.backend.entity.*;

import io.reactivex.rxjava3.core.Flowable;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;

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
import java.util.Optional;

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

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserExerciseService userExerciseService;

    @Autowired
    private WorkoutEntryService workoutEntryService;

    @Autowired
    private WorkoutService workoutService;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private InMemoryRunner runner;

    private LlmAgent progressInsightAgent;
    private LlmAgent progressInsightJsonAgent;
    private InMemoryRunner progressInsightRunner;

    @PostConstruct
    private void init() {
        Client client = Client.builder().vertexAI(false).apiKey(apiKey).build();

        FunctionTool searchTool = FunctionTool.create(this, "searchWeb");
        FunctionTool workoutHistoryTool = FunctionTool.create(this, "getWorkoutHistory");
        FunctionTool personalRecordsTool = FunctionTool.create(this, "getPersonalRecords");
        FunctionTool personalRecordStatsTool = FunctionTool.create(this, "getPersonalRecordStats");
        FunctionTool personalRecordHistoryForExerciseTool = FunctionTool.create(this, "getPersonalRecordHistoryForExercise");
        FunctionTool userProfileTool = FunctionTool.create(this, "getUserProfile");
        FunctionTool userExercisesTool = FunctionTool.create(this, "getUserExercises");
        FunctionTool previousPerformanceTool = FunctionTool.create(this, "getPreviousPerformance");
        FunctionTool workoutCountTool = FunctionTool.create(this, "getWorkoutCount");
        FunctionTool workoutSplitTool = FunctionTool.create(this, "getWorkoutSplit");
        FunctionTool currentActiveSessionTool = FunctionTool.create(this, "getCurrentActiveSession");
        FunctionTool proposeWorkoutPlanTool = FunctionTool.create(this, "proposeWorkoutPlan");

        LlmAgent injurySpecialist = InjurySafetySpecialistAgent.buildAgent(client, searchTool);
        AgentTool injurySpecialistTool = AgentTool.create(injurySpecialist);    

        LlmAgent workoutPlanGenerator = WorkoutPlanGeneratorAgent.buildAgent(client, searchTool, userProfileTool, workoutHistoryTool, personalRecordsTool, personalRecordStatsTool, userExercisesTool, workoutSplitTool, personalRecordHistoryForExerciseTool, previousPerformanceTool, workoutCountTool, currentActiveSessionTool);
        AgentTool workoutPlanGeneratorTool = AgentTool.create(workoutPlanGenerator);

        progressInsightAgent = ProgressInsightAgent.buildAgent(client, userProfileTool, workoutHistoryTool, personalRecordsTool, personalRecordStatsTool, workoutSplitTool, personalRecordHistoryForExerciseTool, previousPerformanceTool, workoutCountTool, false);
        AgentTool progressInsightAgentTool = AgentTool.create(progressInsightAgent);

        progressInsightJsonAgent = ProgressInsightAgent.buildAgent(client, userProfileTool, workoutHistoryTool, personalRecordsTool, personalRecordStatsTool, workoutSplitTool, personalRecordHistoryForExerciseTool, previousPerformanceTool, workoutCountTool, true);

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

                    When the user is enquiring about any topics related to injuries, safety, or injury prevention, use the injury-safety-specialist-agent to provide expert advice.
                    Make sure the response is based on their goals, skill level, and any relevant logged data, and is safe and appropriate for their situation.

                    When the user wants a new workout plan built from scratch, wants changes made to
                    their existing workout split or a specific workout, or asks for progression advice
                    on their program (as opposed to a one-off question about a single exercise), use
                    the workout-plan-generator-agent rather than answering directly. Pass along any
                    relevant details the user gave (e.g. desired split length, target muscle groups,
                    goals) so the sub-agent doesn't have to ask the user to repeat itself.

                    Once the user explicitly approves a finalized workout plan — whether one you proposed yourself
                    or one the workout-plan-generator-agent suggested — call the proposeWorkoutPlan tool with the
                    complete plan as structured data, so it can actually be saved. Only call it after clear approval,
                    never while still drafting or discussing options.
                """)
                .model(new Gemini("gemini-3.5-flash", client))
                .tools(searchTool, workoutHistoryTool, personalRecordsTool, personalRecordStatsTool,
                        personalRecordHistoryForExerciseTool, userProfileTool, userExercisesTool,
                        previousPerformanceTool, workoutCountTool, workoutSplitTool, currentActiveSessionTool, 
                        injurySpecialistTool, workoutPlanGeneratorTool, progressInsightAgentTool, proposeWorkoutPlanTool)
                .build();
        runner = new InMemoryRunner(agent);
    }

    public LlmAgent getProgressInsightAgent() {
        return progressInsightAgent;
    }

    public LlmAgent getProgressInsightJsonAgent() {
        return progressInsightJsonAgent;
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

    @Schema(description = "Retrieves aggregate stats computed across all of the user's personal "
            + "records: their single heaviest lift overall, how many new PRs they've hit this "
            + "month, and which exercise has improved the most recently and by what percentage. "
            + "Use this for progress/trend questions like how the user's training is going overall, "
            + "their best lift ever, or which lift is improving fastest — not for listing individual "
            + "exercise PRs, which getPersonalRecords already covers.")
    public Map<String, Object> getPersonalRecordStats(@Schema(name = "toolContext") ToolContext toolContext){

        Long userId = Long.valueOf((String) toolContext.state().get("userId"));

        PersonalRecordStatsDto prStats = personalRecordService.getStatsForUser(userId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("heaviestWeight", prStats.heaviestWeight());
        stats.put("heaviestExerciseName", prStats.heaviestExerciseName());
        stats.put("totalThisMonth", prStats.totalThisMonth());
        stats.put("mostImprovedExerciseName", prStats.mostImprovedExerciseName());
        stats.put("mostImprovedPercent", prStats.mostImprovedPercent());

        return Map.of("personalRecordsStats", stats);
    }

    @Schema(description = "Retrieves the user's personal record history for one specific exercise — "
            + "every PR achieved on it over time (weight, reps, volume, and date), not just the "
            + "current best. Use this when the user asks how their performance on a specific "
            + "exercise (e.g. 'bench press', 'squat') has progressed over time. Pass the exercise "
            + "name as the user mentioned it; matching is fuzzy so exact spelling isn't required.")
    public Map<String, Object> getPersonalRecordHistoryForExercise(@Schema(name = "toolContext") ToolContext toolContext, @Schema(description = "The name of the exercise to look up history for", name = "exerciseName") String exerciseName){

        Long userId = Long.valueOf((String) toolContext.state().get("userId"));
        Optional<Exercise> exercise = exerciseRepository.findClosestByNameForUser(userId, exerciseName);

        if(exercise.isEmpty()){
            return Map.of("error", "No exercise found matching: " + exerciseName);
        }

        Long exId = exercise.get().getId();

        List<PersonalRecordHistoryDto> history = personalRecordService.getHistoryForExercise(userId, exId);
        List<Map<String, Object>> historyMap = new ArrayList<>();

        for(PersonalRecordHistoryDto entry : history){
            Map<String, Object> entryMap = new HashMap<>();
            entryMap.put("weight", entry.weight());
            entryMap.put("reps", entry.reps());
            entryMap.put("volume", entry.volume());
            entryMap.put("achievedAt", entry.achievedAt());
            entryMap.put("workoutName", entry.workoutName());
            historyMap.add(entryMap);
        }

        return Map.of("exerciseName", exercise.get().getName(), "personalRecordsHistoryForExercise", historyMap);
    }

    @Schema(description = "Retrieves the user's profile: goal, skill level, height, weight, and goal "
        + "weight. Use this before giving skill-level-aware or goal-aware coaching advice, or when "
        + "the user asks about their own stats/goals.")
    public Map<String, Object> getUserProfile(@Schema(name= "toolContext") ToolContext toolContext){

        Long userId = Long.valueOf((String) toolContext.state().get("userId"));
        User userOpt = userService.getUserById(userId);

        Map<String, Object> userProfile = new HashMap<>();
        userProfile.put("firstName", userOpt.getFirstName());
        userProfile.put("height", userOpt.getHeight());
        userProfile.put("weight", userOpt.getWeight());
        userProfile.put("goalWeight", userOpt.getGoalWeight());
        userProfile.put("userGoal", userOpt.getUserGoal());
        userProfile.put("skillLevel", userOpt.getSkillLevel());

        return Map.of("userProfile", userProfile);
    }

    @Schema(description = "Retrieves the list of exercises the user has logged before, with their "
        + "exercise IDs and names, and when each was last performed. Use this to check what "
        + "exercises the user actually trains before answering exercise-specific questions.")
    public Map<String, Object> getUserExercises(@Schema(name= "toolContext") ToolContext toolContext){

        Long userId = Long.valueOf((String) toolContext.state().get("userId"));
        List<UserExercise> userExercises = userExerciseService.getUserExercises(userId);

        List<Map<String, Object>> summarises = new ArrayList<>();
        for(UserExercise entry : userExercises){
            Map<String, Object> entryMap = new HashMap<>();
            entryMap.put("exerciseName", entry.getExercise().getName());
            entryMap.put("lastPerformedAt", entry.getLastPerformedAt());
            summarises.add(entryMap);
        }

        return Map.of("userExercises", summarises);
    }

    @Schema(description = "Retrieves how the user performed the last time they did a specific "
            + "exercise — sets, reps, and weight from their most recent session on it. Use this "
            + "when the user asks what they did last time on an exercise, or to inform a suggested "
            + "next-session target. Pass the exercise name as the user mentioned it; matching is fuzzy.")
    public Map<String, Object> getPreviousPerformance(@Schema(name = "toolContext") ToolContext toolContext,
            @Schema(description = "The name of the exercise to look up", name = "exerciseName") String exerciseName) {

        Long userId = Long.valueOf((String) toolContext.state().get("userId"));
        Optional<Exercise> exercise = exerciseRepository.findClosestByNameForUser(userId, exerciseName);

        if (exercise.isEmpty()) {
            return Map.of("error", "No exercise found matching: " + exerciseName);
        }

        PreviousExercisePerformanceResponse perf = userExerciseService.getPreviousPerformance(userId, exercise.get().getId());
        if (perf == null) {
            return Map.of("error", "No previous performance recorded for: " + exercise.get().getName());
        }

        List<Map<String, Object>> sets = new ArrayList<>();
        for (PreviousSetDto set : perf.getSets()) {
            Map<String, Object> setMap = new HashMap<>();
            setMap.put("setIndex", set.getSetIndex());
            setMap.put("reps", set.getReps());
            setMap.put("weight", set.getWeight());
            setMap.put("completed", set.getCompleted());
            sets.add(setMap);
        }

        return Map.of(
            "exerciseName", perf.getExerciseName(),
            "performedAt", perf.getPerformedAt(),
            "sets", sets
        );
    }


    @Schema(description = "Retrieves the total number of workouts the user has ever logged. Use this "
        + "for questions about overall training volume or how long the user has been consistent.")
    public Map<String, Object> getWorkoutCount(@Schema(name = "toolContext") ToolContext toolContext) {
        Long userId = Long.valueOf((String) toolContext.state().get("userId"));
        long count = workoutEntryService.getWorkoutCountForUserId(userId);

        return Map.of("workoutCount", count);
    }

    @Schema(description = "Retrieves the user's actual workout program/split — the workouts they've "
            + "built (not history), each with its target muscle groups and planned exercises "
            + "(sets/reps/weight targets). Use this when the user asks about their routine or "
            + "program structure, as opposed to what they've actually done recently.")
    public Map<String, Object> getWorkoutSplit(@Schema(name = "toolContext") ToolContext toolContext) {
        Long userId = Long.valueOf((String) toolContext.state().get("userId"));
        List<WorkoutListDto> workouts = workoutService.getUserWorkouts(userId);

        List<Map<String, Object>> summarised = new ArrayList<>();
        for(WorkoutListDto workout : workouts){
            WorkoutDetailDto detail = workoutService.getWorkoutDetail(workout.id());

            List<Map<String, Object>> exercises = new ArrayList<>();
            for (WorkoutDetailDto.WorkoutExerciseDto ex : detail.exercises()) {
                Map<String, Object> exMap = new HashMap<>();
                exMap.put("exerciseName", ex.exerciseName());
                exMap.put("targetSets", ex.targetSets());
                exMap.put("targetReps", ex.targetReps());
                exMap.put("targetWeightKg", ex.targetWeightKg());
                exMap.put("orderIndex", ex.orderIndex());
                exMap.put("restSeconds", ex.restSeconds());
                exercises.add(exMap);
            }

            Map<String, Object> workoutMap = new HashMap<>();
            workoutMap.put("workoutId", detail.id());
            workoutMap.put("workoutName", detail.name());
            workoutMap.put("description", detail.description());
            workoutMap.put("muscleGroups", detail.muscleGroups());
            workoutMap.put("exercises", exercises);
            workoutMap.put("isPredefined", detail.isPredefined());
            summarised.add(workoutMap);
        }

        return Map.of("workoutSplit", summarised);
    }

    @Schema(description = "Checks whether the user currently has an in-progress (unfinished) workout "
            + "session, and if so, what exercises/sets are in it so far. Use this if the user asks "
            + "what they're currently doing, or whether they've started today's workout.")
    public Map<String, Object> getCurrentActiveSession(@Schema(name = "toolContext") ToolContext toolContext) {
        Long userId = Long.valueOf((String) toolContext.state().get("userId"));

        try{
            StartWorkoutResponse session = workoutSessionService.getCurrentActiveSessionForUser(userId);

            List<Map<String, Object>> exercises = new ArrayList<>();
            for (SessionExerciseDto ex : session.getExercises()) {
                Map<String, Object> exMap = new HashMap<>();
                exMap.put("exerciseName", ex.getExerciseName());
                exMap.put("targetSets", ex.getTargetSets());
                exMap.put("targetReps", ex.getTargetReps());
                exMap.put("restSeconds", ex.getRestSeconds());
                exMap.put("orderIndex", ex.getOrderIndex());
                if(!ex.getPreviousSets().isEmpty()) exMap.put("previousSets", ex.getPreviousSets());
                if(!ex.getCurrentSets().isEmpty()) exMap.put("currentSets", ex.getCurrentSets());
                exMap.put("prWeight", ex.getCurrentPrWeight());
                exercises.add(exMap);
            }

            return Map.of(
                "active", true,
                "workoutName", session.getWorkoutName(),
                "startedAt", session.getStartedAt(),
                "exercises", exercises
            );
        }
        catch (EntityNotFoundException e){
            return Map.of("active", false);
        }
    }

    @Schema(description = "Call this ONLY once the user has explicitly approved a finalized workout "
        + "plan (a brand new plan, or changes to an existing one) and wants it saved. Pass the "
        + "complete, final plan as structured data. Do not call this while still discussing or "
        + "drafting ideas with the user — only once they've said something like 'yes, apply it'.")
    public Map<String, Object> proposeWorkoutPlan(
            @Schema(name = "toolContext") ToolContext toolContext,
            @Schema(description = "For an edit to an existing workout, its workoutId (from getWorkoutSplit). "
                    + "Omit or leave null for a brand new workout.", name = "workoutId") Long workoutId,
            @Schema(description = "Name for the workout", name = "workoutName") String workoutName,
            @Schema(description = "The finalized list of exercises in the plan, each with a single "
                    + "target rep count to start at (not a range) — for double-progression exercises "
                    + "still climbing reps, use the next rep count the user should aim for this time, "
                    + "not the eventual top of the range", name = "exercises") List<ProposedExerciseDto> exercises
        )
    {

        Map<String, Object> plan = new HashMap<>();
        plan.put("workoutId", workoutId);
        plan.put("workoutName", workoutName);
        plan.put("exercises", exercises);
        toolContext.state().put("proposedWorkoutPlan", plan);

        return Map.of("status", "Plan captured and ready to apply.");
    }

    public ChatResult chat(String userId, String message) {
        Map<String, Object> initialState = Map.of("userId", userId);
        Session session = runner.sessionService()
            .getSession(runner.appName(), userId, userId, Optional.empty())
            .switchIfEmpty(runner.sessionService().createSession(runner.appName(), userId, initialState, userId)).blockingGet();

        Content userMsg = Content.fromParts(Part.fromText(message));
        Flowable<Event> events = runner.runAsync(session.userId(), session.id(), userMsg);

        StringBuilder reply = new StringBuilder();
        events.blockingForEach(event -> {
            if(event.finalResponse())
                reply.append(event.stringifyContent());
        });

        Session updatedSession = runner.sessionService()
            .getSession(runner.appName(), session.userId(), session.id(), Optional.empty())
            .blockingGet();
        Object proposedPlan = updatedSession.state().get("proposedWorkoutPlan");
        updatedSession.state().remove("proposedWorkoutPlan");

        return new ChatResult(reply.toString(), proposedPlan);
    }

    public record ChatResult(String reply, Object proposedWorkoutPlan) {}

}
