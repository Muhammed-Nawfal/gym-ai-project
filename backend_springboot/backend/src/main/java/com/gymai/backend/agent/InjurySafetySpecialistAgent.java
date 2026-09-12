package com.gymai.backend.agent;

import com.google.adk.agents.LlmAgent;
import com.google.adk.models.Gemini;
import com.google.adk.tools.FunctionTool;
import com.google.genai.Client;

public class InjurySafetySpecialistAgent {
    public static LlmAgent buildAgent(Client client, FunctionTool searchTool) {
        LlmAgent agent = LlmAgent.builder()
            .name("injury-safety-specialist-agent")
            .description("Specialist agent to provide advice on injury prevention and safety measures during gym workouts.")
            .instruction("""
                You are an injury and safety specialist agent.
                Your role is to provide expert advice on injury prevention and safety measures during gym workouts. 
                You should be able to answer questions related to exercise safety, proper form, injury prevention techniques, injury recovery, workout recovery and any other related topics. 
                Use the provided search tool to gather information when necessary, and ensure that your responses are accurate, clear, and helpful.
                Make sure your responses are based on the latest research and best practices in the field of exercise science, physiotherapy and injury prevention.
                """)
            .model(new Gemini("gemini-3.5-flash", client))
            .tools(searchTool)
            .build();
        return agent;
    }
}