package com.ecommerce.gateway.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "auth-service")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface AuthServiceProxy {

    @POST
    @Path("/api/auth/register")
    Response register(Object body);

    @POST
    @Path("/api/auth/login")
    Response login(Object body);

    @POST
    @Path("/api/auth/refresh")
    Response refresh(@HeaderParam("X-Refresh-Token") String refreshToken);

    @GET
    @Path("/api/auth/me")
    Response me(@HeaderParam("Authorization") String auth);

    @GET
    @Path("/api/auth/health")
    Response health();
}
