package com.mediverse.auth.security;

import com.mediverse.common.config.properties.JwtProperties;
import com.mediverse.user.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Issues and verifies access tokens. Refresh tokens are opaque (handled by
 * {@link TokenHasher}) and looked up in the database, not signed.
 *
 * <p>Access-token claims:
 * <ul>
 *   <li>{@code sub} — user id (string)</li>
 *   <li>{@code email} — user email</li>
 *   <li>{@code role} — {@code PATIENT} or {@code DOCTOR}</li>
 *   <li>{@code iss}, {@code iat}, {@code exp}</li>
 * </ul>
 */
@Service
@Slf4j
public class JwtService {

    private static final int MIN_SECRET_BYTES = 32;

    private final JwtProperties props;
    private final SecretKey signingKey;
    private final Duration accessTtl;
    private final Duration refreshTtl;

    public JwtService(JwtProperties props) {
        this.props = props;
        byte[] secretBytes = props.secret().getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException(
                    "jwt.secret must be at least %d bytes (256 bits) for HS256; got %d. "
                            .formatted(MIN_SECRET_BYTES, secretBytes.length)
                            + "Set the JWT_SECRET env var to a long random string.");
        }
        this.signingKey = Keys.hmacShaKeyFor(secretBytes);
        this.accessTtl = Duration.ofMinutes(props.accessTtlMinutes());
        this.refreshTtl = Duration.ofDays(props.refreshTtlDays());
    }

    @PostConstruct
    void logBoot() {
        log.info(
                "JwtService ready: issuer='{}', accessTtl={}m, refreshTtl={}d",
                props.issuer(),
                props.accessTtlMinutes(),
                props.refreshTtlDays());
    }

    /** Returns a signed access JWT for the given user. */
    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant exp = now.plus(accessTtl);
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .issuer(props.issuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Parses and verifies an access token. Throws {@link JwtException} on any
     * failure (bad signature, expired, malformed, wrong issuer).
     */
    public Jws<Claims> parseAccessToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(props.issuer())
                .build()
                .parseSignedClaims(token);
    }

    /** Convenience: extract the user id from a verified access token. */
    public Long extractUserId(Jws<Claims> jws) {
        return Long.valueOf(jws.getPayload().getSubject());
    }

    public Duration accessTtl() {
        return accessTtl;
    }

    public Duration refreshTtl() {
        return refreshTtl;
    }
}
