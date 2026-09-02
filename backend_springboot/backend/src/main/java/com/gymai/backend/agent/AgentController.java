package com.gymai.backend.agent;

import com.gymai.backend.entity.User;
import com.gymai.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    private final GymAgentService gymAgentService;
    private final UserRepository userRepository;

    public AgentController(GymAgentService gymAgentService, UserRepository userRepository) {
        this.gymAgentService = gymAgentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String reply = gymAgentService.chat(String.valueOf(user.getId()), request.message());
        return new ChatResponse(reply);
    }

    public record ChatRequest(String message) {}
    public record ChatResponse(String reply) {}
}
