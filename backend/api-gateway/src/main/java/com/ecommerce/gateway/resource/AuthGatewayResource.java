package com.ecommerce.gateway.resource;

import com.ecommerce.gateway.client.AuthServiceProxy;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication (via Gateway)", description = "Proxied to auth-service")
public class AuthGatewayResource {

    @Inject
    @RestClient
    AuthServiceProxy authServiceProxy;

    @POST
    @Path("/register")
    @PermitAll
    @Operation(summary = "Register a new user account")
    public Response register(Object body) {
        return authServiceProxy.register(body);
    }

    @POST
    @Path("/login")
    @PermitAll
    @Operation(summary = "Login and return tokens")
    public Response login(Object body) {
        return authServiceProxy.login(body);
    }

    @POST
    @Path("/refresh")
    @PermitAll
    @Operation(summary = "Refresh access token")
    public Response refresh(@Context HttpHeaders headers) {
        return authServiceProxy.refresh(headers.getHeaderString("X-Refresh-Token"));
    }

    @GET
    @Path("/me")
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Get current user info")
    public Response me(@Context HttpHeaders headers) {
        return authServiceProxy.me(authHeader(headers));
    }

    @GET
    @Path("/health")
    @PermitAll
    @Operation(summary = "Auth service health check")
    public Response health() {
        return authServiceProxy.health();
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
