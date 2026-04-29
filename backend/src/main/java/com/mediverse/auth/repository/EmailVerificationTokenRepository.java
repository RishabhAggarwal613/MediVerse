package com.mediverse.auth.repository;

import com.mediverse.auth.domain.EmailVerificationToken;
import com.mediverse.user.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("DELETE FROM EmailVerificationToken t WHERE t.user = :user")
    int deleteAllByUser(@Param("user") User user);
}
