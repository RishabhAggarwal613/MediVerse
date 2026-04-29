package com.mediverse.auth.oauth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;

@Configuration
@Conditional(GoogleOAuthCredentialsPresent.class)
public class GoogleOAuthClientConfig {

    @Bean
    public ClientRegistrationRepository googleClientRegistrationRepository(Environment env) {
        String clientId = env.getRequiredProperty("google.oauth.client-id");
        String clientSecret = env.getRequiredProperty("google.oauth.client-secret");

        ClientRegistration google =
                ClientRegistration.withRegistrationId("google")
                        .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                        .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                        .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                        .scope("openid", "profile", "email")
                        .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                        .tokenUri("https://oauth2.googleapis.com/token")
                        .userInfoUri("https://openidconnect.googleapis.com/v1/userinfo")
                        .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                        .issuerUri("https://accounts.google.com")
                        .userNameAttributeName("sub")
                        .clientName("Google")
                        .clientId(clientId)
                        .clientSecret(clientSecret)
                        .build();

        return new InMemoryClientRegistrationRepository(google);
    }
}
