package com.ecommerce.gateway.resource;

import com.ecommerce.gateway.client.UserServiceProxy;
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

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Users (via Gateway)", description = "Proxied to user-service")
public class UserGatewayResource {

    @Inject
    @RestClient
    UserServiceProxy userServiceProxy;

    @GET
    @Path("/me")
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Get current user profile")
    public Response getMyProfile(@Context HttpHeaders headers) {
        return userServiceProxy.getMyProfile(authHeader(headers));
    }

    @PUT
    @Path("/me")
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Update current user profile")
    public Response updateMyProfile(@Context HttpHeaders headers, Object body) {
        return userServiceProxy.updateMyProfile(authHeader(headers), body);
    }

    @GET
    @Path("/{userId}")
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Get user profile by ID")
    public Response getById(@Context HttpHeaders headers, @PathParam("userId") String userId) {
        return userServiceProxy.getById(authHeader(headers), userId);
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
