package com.ecommerce.gateway.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "notification-service")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface NotificationServiceProxy {

    @GET
    @Path("/api/notifications")
    Response getMyNotifications(@HeaderParam("Authorization") String auth);

    @GET
    @Path("/api/notifications/unread")
    Response getUnread(@HeaderParam("Authorization") String auth);

    @PUT
    @Path("/api/notifications/{id}/read")
    Response markAsRead(
            @HeaderParam("Authorization") String auth,
            @PathParam("id") String id
    );
}
