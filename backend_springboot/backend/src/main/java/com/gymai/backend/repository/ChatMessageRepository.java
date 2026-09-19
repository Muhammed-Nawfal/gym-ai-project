// repository/ChatMessageRepository.java
package com.gymai.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gymai.backend.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatIdOrderByCreatedAtAsc(Long chatId);
}