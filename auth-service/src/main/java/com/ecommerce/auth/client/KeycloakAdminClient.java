package com.ecommerce.auth.client;

import com.ecommerce.auth.dto.KeycloakUserRepresentation;
import com.ecommerce.auth.dto.TokenResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

/**
 * REST client for Keycloak Admin REST API.
 * Used by auth-service to create users, reset passwords, and list users.
 *
 * Base URL: http://localhost:8080 (configured in application.properties)
 */
@RegisterRestClient(configKey = "keycloak-admin")
@Path("/admin/realms/ecommerce")
public interface KeycloakAdminClient {

    // ─── Users ───────────────────────────────────────────────────────────────

    @POST
    @Path("/users")
    @Consumes(MediaType.APPLICATION_JSON)
    Response createUser(
            @HeaderParam("Authorization") String bearerToken,
            KeycloakUserRepresentation user
    );

    @GET
    @Path("/users")
    @Produces(MediaType.APPLICATION_JSON)
    List<KeycloakUserRepresentation> findUsersByEmail(
            @HeaderParam("Authorization") String bearerToken,
            @QueryParam("email") String email
    );

    @GET
    @Path("/users/{userId}")
    @Produces(MediaType.APPLICATION_JSON)
    KeycloakUserRepresentation getUserById(
            @HeaderParam("Authorization") String bearerToken,
            @PathParam("userId") String userId
    );

    @DELETE
    @Path("/users/{userId}")
    Response deleteUser(
            @HeaderParam("Authorization") String bearerToken,
            @PathParam("userId") String userId
    );

    // ─── Role Mappings ────────────────────────────────────────────────────────

    @POST
    @Path("/users/{userId}/role-mappings/realm")
    @Consumes(MediaType.APPLICATION_JSON)
    Response assignRealmRoles(
            @HeaderParam("Authorization") String bearerToken,
            @PathParam("userId") String userId,
            List<RoleRepresentation> roles
    );

    @GET
    @Path("/roles")
    @Produces(MediaType.APPLICATION_JSON)
    List<RoleRepresentation> getRealmRoles(
            @HeaderParam("Authorization") String bearerToken
    );

    record RoleRepresentation(String id, String name) {}
}
