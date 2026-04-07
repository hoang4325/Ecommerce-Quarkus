package com.ecommerce.notification.resource;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.notification.entity.Notification;
import com.ecommerce.notification.service.NotificationService;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Notifications")
public class NotificationResource {

    @Inject NotificationService notificationService;
    @Inject SecurityIdentity identity;

    private UUID currentUserId() {
        return UUID.fromString(identity.getPrincipal().getName());
    }

    @GET
    @RolesAllowed({"USER", "ADMIN"})
    public ApiResponse<List<Notification>> getMyNotifications() {
        return ApiResponse.success(notificationService.getUserNotifications(currentUserId()));
    }

    @GET
    @Path("/unread")
    @RolesAllowed({"USER", "ADMIN"})
    public ApiResponse<List<Notification>> getUnread() {
        return ApiResponse.success(notificationService.getUnread(currentUserId()));
    }

    @PUT
    @Path("/{id}/read")
    @RolesAllowed({"USER", "ADMIN"})
    public ApiResponse<String> markAsRead(@PathParam("id") UUID id) {
        notificationService.markAsRead(id);
        return ApiResponse.success("Marked as read");
    }
}
