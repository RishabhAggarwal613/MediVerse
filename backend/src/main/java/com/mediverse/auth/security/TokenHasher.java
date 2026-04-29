package com.mediverse.auth.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Generates opaque tokens (refresh, email-verify, password-reset) and hashes
 * them for storage.
 *
 * <p>Plaintext is returned to the client exactly once; the database only ever
 * stores the SHA-256 hex digest. A DB compromise alone cannot replay tokens.
 */
public final class TokenHasher {

    private static final SecureRandom RNG = new SecureRandom();
    private static final int RANDOM_BYTES = 32;

    private TokenHasher() {}

    /** Generates a 256-bit, URL-safe base64 token (no padding). 43 chars long. */
    public static String generate() {
        byte[] bytes = new byte[RANDOM_BYTES];
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /** Returns the SHA-256 hex digest (64 chars, lowercase) of the given token. */
    public static String hash(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available on this JVM", e);
        }
    }
}
