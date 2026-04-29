package com.mediverse.auth.oauth;

import org.springframework.boot.autoconfigure.condition.ConditionOutcome;
import org.springframework.boot.autoconfigure.condition.SpringBootCondition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.env.Environment;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.util.StringUtils;

/**
 * True when {@code google.oauth.client-id} and {@code google.oauth.client-secret}
 * are non-blank — Spring Security OAuth2 login beans should only load in this case.
 */
public class GoogleOAuthCredentialsPresent extends SpringBootCondition {

    @Override
    public ConditionOutcome getMatchOutcome(
            ConditionContext context, AnnotatedTypeMetadata metadata) {
        Environment env = context.getEnvironment();
        String id = env.getProperty("google.oauth.client-id", "");
        String sec = env.getProperty("google.oauth.client-secret", "");
        if (StringUtils.hasText(id) && StringUtils.hasText(sec)) {
            return ConditionOutcome.match("google.oauth credentials are set");
        }
        return ConditionOutcome.noMatch("google.oauth credentials missing or incomplete");
    }
}
