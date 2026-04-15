package com.ecommerce.gateway.resource;

import com.ecommerce.gateway.client.OrderServiceProxy;
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

@Path("/api/admin/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")
@Tag(name = "Orders Admin (via Gateway)", description = "Admin order management — proxied to order-service")
@SecurityRequirement(name = "JWT")
public class OrderAdminGatewayResource {

    @Inject
    @RestClient
    OrderServiceProxy orderServiceProxy;

    @GET
    @Operation(summary = "List all orders (ADMIN)")
    public Response listAll(
            @Context HttpHeaders headers,
            @QueryParam("page") @DefaultValue("0") Integer page,
            @QueryParam("size") @DefaultValue("20") Integer size,
            @QueryParam("status") String status) {
        return orderServiceProxy.adminListOrders(authHeader(headers), page, size, status);
    }

    @PUT
    @Path("/{id}/status")
    @Operation(summary = "Update order status (ADMIN)")
    public Response updateStatus(
            @Context HttpHeaders headers,
            @PathParam("id") String id,
            @QueryParam("status") String status) {
        return orderServiceProxy.adminUpdateStatus(authHeader(headers), id, status);
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
