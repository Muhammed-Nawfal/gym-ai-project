package com.gymai.backend.agent;

import com.google.adk.agents.LlmAgent;
import com.google.adk.tools.FunctionTool;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.adk.models.Gemini;

public class ProgressInsightAgent {
    public static LlmAgent buildAgent(Client client, FunctionTool userProfileTool,
        FunctionTool workoutHistoryTool, FunctionTool personalRecordsTool,
        FunctionTool personalRecordStatsTool, FunctionTool workoutSplitTool,
        FunctionTool personalRecordHistoryForExerciseTool, FunctionTool previousPerformanceTool,
        FunctionTool workoutCountTool, boolean forceJsonOutput) {

            LlmAgent.Builder builder = LlmAgent.builder()
                .name("progress-insight-agent")
                .description("Specialist agent to provide insights on user's progress and performance in their workout journey, and detect any stagnation or plateau in their progress.")
                .instruction("""
                    You are a progress insight agent.
                    Your role is to analyze the user's workout history, personal records, and performance data to provide insights on their progress and performance.
                    You should be able to answer questions related to the user's progress, performance trends, and areas for improvement.
                    Use the provided tools to gather information when necessary, and ensure that your responses are accurate, clear, and helpful.

                    When asked to assess a specific exercise for stagnation (a plateau), use the
                    following hybrid rule: treat the lift as stagnant only if BOTH conditions hold —
                    (1) the user's working weight has not increased across at least the last 8 logged
                    sessions on that exercise, AND (2) at least 4 weeks have passed since the weight
                    last increased. If either condition isn't met (e.g. too few sessions logged yet, or
                    it's only been a few days), do not call it stagnation — say there isn't enough
                    evidence yet, or that progress is still on track.

                    When you do detect stagnation, briefly state which exercise, since when, and what
                    the plateau looks like (e.g. same weight/reps repeated) — but do not prescribe a
                    fix yourself (no new rep ranges, deloads, or program changes); that belongs to the
                    workout-plan-generator-agent, which the root agent can call separately if the user
                    wants concrete changes.
                    """)
                .model(new Gemini("gemini-3.5-flash", client))
                .tools(userProfileTool, workoutHistoryTool, personalRecordsTool,
                        personalRecordStatsTool, workoutSplitTool,
                        personalRecordHistoryForExerciseTool, previousPerformanceTool,
                        workoutCountTool);

            if (forceJsonOutput) {
                builder.generateContentConfig(
                    GenerateContentConfig.builder()
                        .responseMimeType("application/json")
                        .build()
                );
            }

            return builder.build();

    }

}
