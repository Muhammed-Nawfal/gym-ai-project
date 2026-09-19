package com.gymai.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymai.backend.dto.ChatMessageDto;
import com.gymai.backend.dto.ChatSummaryDto;
import com.gymai.backend.entity.Chat;
import com.gymai.backend.entity.ChatMessage;
import com.gymai.backend.entity.User;
import com.gymai.backend.enums.ChatRole;
import com.gymai.backend.repository.ChatMessageRepository;
import com.gymai.backend.repository.ChatRepository;
import com.gymai.backend.service.GymAgentService.ChatResult;

@Service
public class ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private GymAgentService gymAgentService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatSummaryDto createChat(User user) {
        Chat chat = new Chat();
        chat.setUser(user);
        chat.setUpdatedAt(LocalDateTime.now());
        return toSummaryDto(chatRepository.save(chat));
    }

    public List<ChatSummaryDto> listChats(Long userId) {
        return chatRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream().map(this::toSummaryDto).toList();
    }

    public List<ChatMessageDto> getMessages(Long chatId, Long userId) {
        Chat chat = getOwnedChat(chatId, userId);
        return chatMessageRepository.findByChatIdOrderByCreatedAtAsc(chat.getId())
                .stream().map(this::toMessageDto).toList();
    }

    public ChatMessageDto postMessage(Long chatId, User user, String messageText, Long insightId) {
        Chat chat = getOwnedChat(chatId, user.getId());

        ChatMessage userMessage = new ChatMessage();
        userMessage.setChat(chat);
        userMessage.setRole(ChatRole.USER);
        userMessage.setContent(messageText);
        chatMessageRepository.save(userMessage);

        if (chat.getTitle() == null) {
            chat.setTitle(messageText.length() > 40 ? messageText.substring(0, 40) + "..." : messageText);
        }

        ChatResult result = gymAgentService.chat(String.valueOf(user.getId()), chat.getId(), messageText, insightId);

        ChatMessage assistantMessage = new ChatMessage();
        assistantMessage.setChat(chat);
        assistantMessage.setRole(ChatRole.ASSISTANT);
        assistantMessage.setContent(result.reply());
        if (result.proposedWorkoutPlan() != null) {
            try {
                assistantMessage.setProposedWorkoutPlanJson(objectMapper.writeValueAsString(result.proposedWorkoutPlan()));
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize proposed workout plan", e);
            }
        }
        if (result.resolvableInsight() != null) {
            try {
                assistantMessage.setResolvableInsightJson(objectMapper.writeValueAsString(result.resolvableInsight()));
            } catch (Exception e) {
                throw new RuntimeException("Failed to serialize resolvable insight", e);
            }
        }
        ChatMessage savedAssistantMessage = chatMessageRepository.save(assistantMessage);

        chat.setUpdatedAt(LocalDateTime.now());
        chatRepository.save(chat);

        return toMessageDto(savedAssistantMessage);
    }

    public void markPlanApplied(Long chatId, Long messageId, Long userId) {
        Chat chat = getOwnedChat(chatId, userId);
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        if (!message.getChat().getId().equals(chat.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found");
        }

        message.setPlanApplied(true);
        chatMessageRepository.save(message);
    }

    public void markInsightResolved(Long chatId, Long messageId, Long userId) {
        Chat chat = getOwnedChat(chatId, userId);
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));

        if (!message.getChat().getId().equals(chat.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found");
        }

        message.setInsightResolved(true);
        chatMessageRepository.save(message);
    }

    public void deleteChat(Long chatId, Long userId) {
        chatRepository.delete(getOwnedChat(chatId, userId));
    }

    private Chat getOwnedChat(Long chatId, Long userId) {
        return chatRepository.findByIdAndUserId(chatId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat not found"));
    }

    private ChatSummaryDto toSummaryDto(Chat chat) {
        return new ChatSummaryDto(chat.getId(), chat.getTitle(), chat.getCreatedAt(), chat.getUpdatedAt());
    }

    private ChatMessageDto toMessageDto(ChatMessage message) {
        Object proposedPlan = null;
        if (message.getProposedWorkoutPlanJson() != null) {
            try {
                proposedPlan = objectMapper.readValue(message.getProposedWorkoutPlanJson(), Object.class);
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse stored proposed workout plan", e);
            }
        }

        Object resolvableInsight = null;
        if (message.getResolvableInsightJson() != null) {
            try {
                resolvableInsight = objectMapper.readValue(message.getResolvableInsightJson(), Object.class);
            } catch (Exception e) {
                throw new RuntimeException("Failed to parse stored resolvable insight", e);
            }
        }

        return new ChatMessageDto(
                message.getId(), message.getRole(), message.getContent(),
                proposedPlan, message.getPlanApplied(),
                resolvableInsight, message.getInsightResolved(),
                message.getCreatedAt()
        );
    }
}