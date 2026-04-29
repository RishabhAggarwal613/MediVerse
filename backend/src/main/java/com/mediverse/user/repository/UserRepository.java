package com.mediverse.user.repository;

import com.mediverse.user.domain.Provider;
import com.mediverse.user.domain.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByProviderAndProviderId(Provider provider, String providerId);
}
