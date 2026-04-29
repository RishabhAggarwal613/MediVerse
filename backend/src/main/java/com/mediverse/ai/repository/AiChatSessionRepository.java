package com.mediverse.ai.repository;

import com.mediverse.ai.domain.AiChatSession;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiChatSessionRepository extends JpaRepository<AiChatSession, Long> {

    List<AiChatSession> findByUser_IdOrderByUpdatedAtDesc(Long userId);

    Optional<AiChatSession> findByIdAndUser_Id(Long id, Long userId);
}
