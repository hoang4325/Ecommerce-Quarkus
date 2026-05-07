package com.ecommerce.gateway.resource;

import com.ecommerce.gateway.client.NotificationServiceProxy;
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

@Path("/api/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Notifications (via Gateway)", description = "Proxied to notification-service")
public class NotificationGatewayResource {

    @Inject
    @RestClient
    NotificationServiceProxy notificationServiceProxy;

    @GET
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Get current user's notifications")
    public Response getMyNotifications(@Context HttpHeaders headers) {
        return notificationServiceProxy.getMyNotifications(authHeader(headers));
    }

    @GET
    @Path("/unread")
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Get unread notifications")
    public Response getUnread(@Context HttpHeaders headers) {
        return notificationServiceProxy.getUnread(authHeader(headers));
    }

    @PUT
    @Path("/{id}/read")
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Mark notification as read")
    public Response markAsRead(@Context HttpHeaders headers, @PathParam("id") String id) {
        return notificationServiceProxy.markAsRead(authHeader(headers), id);
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
