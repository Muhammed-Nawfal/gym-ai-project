// repository/ChatRepository.java
package com.gymai.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gymai.backend.entity.Chat;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByUserIdOrderByUpdatedAtDesc(Long userId);
    Optional<Chat> findByIdAndUserId(Long id, Long userId);
}