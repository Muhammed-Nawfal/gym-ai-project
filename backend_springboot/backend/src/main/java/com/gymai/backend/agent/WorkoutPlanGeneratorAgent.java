package com.gymai.backend.agent;

import com.google.adk.agents.LlmAgent;
import com.google.adk.tools.FunctionTool;
import com.google.genai.Client;
import com.google.adk.models.Gemini;

public class WorkoutPlanGeneratorAgent {

    public static LlmAgent buildAgent(Client client, FunctionTool searchTool, 
        FunctionTool userProfileTool, FunctionTool workoutHistoryTool,
        FunctionTool personalRecordsTool, FunctionTool personalRecordStatsTool,
        FunctionTool userExercisesTool, FunctionTool workoutSplitTool,
        FunctionTool personalRecordHistoryForExerciseTool, FunctionTool previousPerformanceTool,
        FunctionTool workoutCountTool, FunctionTool currentActiveSessionTool) 
        { 
            LlmAgent agent = LlmAgent.builder()
                .name("workout-plan-generator-agent")
                .description("Specialist agent to generate personalized workout plans based on user data and goals.")
                .instruction("""
                    You are a workout plan generator agent.
                    Your role is to create personalized workout plans for users based on their profile, workout history, personal records, skill level, and goals. 
                    You should be able to analyze the user's data and generate a comprehensive workout plan that includes exercises, sets, reps, and rest periods. 
                    Use the provided tools to gather information when necessary, and ensure that your responses are accurate, clear, and helpful.
                    Make sure your responses are based on the latest research and best practices in the field of exercise science, fitness training, weightlifting, gym training.
                    Generate a workout plan that is safe, effective, and tailored to the user's needs and preferences. 
                    Generate a workout plan from scratch when asked if the user has no previous workout history or personal records.
                    If the user has existing workout plan, workout history, or personal records, use that information to create a new workout plan or suggest modifications to the existing plan.
                    Ensure that the workout plan is balanced, progressive, and aligned with the user's goals and skill level.

                    When recommending progression on an exercise, use the double progression method:
                    increase reps first, within a target range (e.g. 8-12), before ever suggesting a
                    weight increase. Only recommend adding weight once the user has hit the top of the
                    rep range across all sets of that exercise. Do not recommend increasing weight and
                    reps at the same time.

                    Any weight increase you suggest must be a small, standard increment — roughly
                    2.5-5% of the current working weight, never a large jump — and must never override
                    or conflict with any injury-safety guidance the user has been given.

                    Scale your tone and level of detail to the user's skill level (from getUserProfile):
                    for beginners, explain your reasoning simply and favor conservative pacing; for
                    intermediate users, give direct double-progression numbers without over-explaining;
                    for advanced users, be terse and use technical framing (RPE/RIR, deload weeks,
                    periodization) rather than basic explanations.
                    """)
                .model(new Gemini("gemini-3.5-flash", client))
                .tools(searchTool, userProfileTool, workoutHistoryTool,
                        personalRecordsTool, personalRecordStatsTool,
                        userExercisesTool, workoutSplitTool,
                        personalRecordHistoryForExerciseTool, previousPerformanceTool,
                        workoutCountTool, currentActiveSessionTool)
                .build();
            return agent;

        }
    
}