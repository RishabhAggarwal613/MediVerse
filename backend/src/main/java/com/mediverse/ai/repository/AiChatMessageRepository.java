package com.mediverse.ai.repository;

import com.mediverse.ai.domain.AiChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {

    List<AiChatMessage> findBySession_IdOrderByCreatedAtAsc(Long sessionId);
}
