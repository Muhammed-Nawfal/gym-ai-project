package com.gymai.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.gymai.backend.dto.ChatMessageDto;
import com.gymai.backend.dto.ChatSummaryDto;
import com.gymai.backend.entity.User;
import com.gymai.backend.repository.UserRepository;
import com.gymai.backend.service.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor 
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    private User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @PostMapping
    public ChatSummaryDto createChat() {
        return chatService.createChat(currentUser());
    }

    @GetMapping
    public List<ChatSummaryDto> listChats() {
        return chatService.listChats(currentUser().getId());
    }

    @GetMapping("/{chatId}/messages")
    public List<ChatMessageDto> getMessages(@PathVariable Long chatId) {
        return chatService.getMessages(chatId, currentUser().getId());
    }

    @PostMapping("/{chatId}/messages")
    public ChatMessageDto postMessage(@PathVariable Long chatId, @RequestBody ChatMessageRequest request) {
        return chatService.postMessage(chatId, currentUser(), request.message(), request.insightId());
    }

    @PatchMapping("/{chatId}/messages/{messageId}/plan-applied")
    public void markPlanApplied(@PathVariable Long chatId, @PathVariable Long messageId) {
        chatService.markPlanApplied(chatId, messageId, currentUser().getId());
    }

    @PatchMapping("/{chatId}/messages/{messageId}/insight-resolved")
    public void markInsightResolved(@PathVariable Long chatId, @PathVariable Long messageId) {
        chatService.markInsightResolved(chatId, messageId, currentUser().getId());
    }

    @DeleteMapping("/{chatId}")
    public void deleteChat(@PathVariable Long chatId) {
        chatService.deleteChat(chatId, currentUser().getId());
    }

    public record ChatMessageRequest(String message, Long insightId) {}
}