package com.ecommerce.auth.service;

import com.ecommerce.auth.client.KeycloakAdminClient;
import com.ecommerce.auth.client.KeycloakAdminClient.RoleRepresentation;
import com.ecommerce.auth.client.KeycloakTokenClient;
import com.ecommerce.auth.dto.*;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class AuthService {

    private static final Logger LOG = Logger.getLogger(AuthService.class);

    @RestClient KeycloakAdminClient adminClient;
    @RestClient KeycloakTokenClient tokenClient;

    @ConfigProperty(name = "keycloak.admin.client-id")
    String adminClientId;

    @ConfigProperty(name = "keycloak.admin.client-secret")
    String adminClientSecret;

    // ─── Register ──────────────────────────────────────────────────────────────

    public UserInfoDTO register(RegisterRequest request) {
        String adminToken = getAdminToken();

        // Check if email already exists
        List<KeycloakUserRepresentation> existing = adminClient.findUsersByEmail(
                "Bearer " + adminToken, request.getEmail());
        if (!existing.isEmpty()) {
            throw new BusinessException("Email '" + request.getEmail() + "' is already registered");
        }

        // Build user representation
        KeycloakUserRepresentation user = new KeycloakUserRepresentation();
        user.setEmail(request.getEmail());
        user.setUsername(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEnabled(true);
        user.setEmailVerified(true);

        KeycloakUserRepresentation.CredentialRepresentation cred = new KeycloakUserRepresentation.CredentialRepresentation();
        cred.setValue(request.getPassword());
        user.setCredentials(List.of(cred));

        // Create user in Keycloak
        Response createResponse = adminClient.createUser("Bearer " + adminToken, user);
        if (createResponse.getStatus() != 201) {
            throw new BusinessException("Failed to create user in Keycloak (status=" + createResponse.getStatus() + ")", 500);
        }

        // Extract user ID from Location header: .../users/{userId}
        String location = createResponse.getHeaderString("Location");
        String userId = location.substring(location.lastIndexOf('/') + 1);

        // Assign USER role
        assignRoleToUser(adminToken, userId, "USER");

        LOG.infof("Registered new user: %s (id=%s)", request.getEmail(), userId);

        return UserInfoDTO.builder()
                .id(userId)
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .roles(List.of("USER"))
                .emailVerified(true)
                .build();
    }

    // ─── Login ─────────────────────────────────────────────────────────────────

    public TokenResponse login(LoginRequest request) {
        try {
            TokenResponse token = tokenClient.getToken(
                    "password",
                    adminClientId,
                    adminClientSecret,
                    request.getEmail(),
                    request.getPassword(),
                    "openid"
            );
            LOG.infof("User logged in: %s", request.getEmail());
            return token;
        } catch (Exception e) {
            LOG.warnf("Login failed for %s: %s", request.getEmail(), e.getMessage());
            throw new BusinessException("Invalid email or password", 401);
        }
    }

    // ─── Refresh Token ─────────────────────────────────────────────────────────

    public TokenResponse refreshToken(String refreshToken) {
        try {
            return tokenClient.getToken(
                    "refresh_token",
                    adminClientId,
                    adminClientSecret,
                    null, null, null
            );
        } catch (Exception e) {
            throw new BusinessException("Invalid or expired refresh token", 401);
        }
    }

    // ─── Get User Info ─────────────────────────────────────────────────────────

    public UserInfoDTO getUserInfo(String userId) {
        String adminToken = getAdminToken();
        KeycloakUserRepresentation kcUser = adminClient.getUserById("Bearer " + adminToken, userId);
        if (kcUser == null) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return UserInfoDTO.builder()
                .id(kcUser.getId())
                .email(kcUser.getEmail())
                .firstName(kcUser.getFirstName())
                .lastName(kcUser.getLastName())
                .emailVerified(kcUser.isEmailVerified())
                .roles(List.of()) // Roles fetched separately if needed
                .build();
    }

    // ─── Internal helpers ──────────────────────────────────────────────────────

    private String getAdminToken() {
        TokenResponse token = tokenClient.getToken(
                "client_credentials",
                adminClientId,
                adminClientSecret,
                null, null, null
        );
        return token.getAccessToken();
    }

    private void assignRoleToUser(String adminToken, String userId, String roleName) {
        List<RoleRepresentation> allRoles = adminClient.getRealmRoles("Bearer " + adminToken);
        List<RoleRepresentation> roleToAssign = allRoles.stream()
                .filter(r -> roleName.equals(r.name()))
                .collect(Collectors.toList());

        if (roleToAssign.isEmpty()) {
            LOG.warnf("Role '%s' not found in Keycloak realm — skipping assignment", roleName);
            return;
        }

        Response response = adminClient.assignRealmRoles("Bearer " + adminToken, userId, roleToAssign);
        if (response.getStatus() >= 400) {
            LOG.warnf("Failed to assign role '%s' to user %s (status=%d)", roleName, userId, response.getStatus());
        }
    }
}
