package com.ecommerce.gateway.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "user-service")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface UserServiceProxy {

    @GET
    @Path("/api/users/me")
    Response getMyProfile(@HeaderParam("Authorization") String auth);

    @PUT
    @Path("/api/users/me")
    Response updateMyProfile(
            @HeaderParam("Authorization") String auth,
            Object body
    );

    @GET
    @Path("/api/users/{userId}")
    Response getById(
            @HeaderParam("Authorization") String auth,
            @PathParam("userId") String userId
    );
}
