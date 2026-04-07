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

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Orders (via Gateway)", description = "Proxied to order-service")
@SecurityRequirement(name = "JWT")
public class OrderGatewayResource {

    @Inject
    @RestClient
    OrderServiceProxy orderServiceProxy;

    @POST
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Create order from active cart")
    public Response create(@Context HttpHeaders headers, Object body) {
        return orderServiceProxy.createOrder(authHeader(headers), body);
    }

    @GET
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "List own orders")
    public Response list(@Context HttpHeaders headers) {
        return orderServiceProxy.getOrders(authHeader(headers));
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Get order by ID")
    public Response getById(@Context HttpHeaders headers, @PathParam("id") String id) {
        return orderServiceProxy.getOrder(authHeader(headers), id);
    }

    @PUT
    @Path("/{id}/cancel")
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Cancel order")
    public Response cancel(@Context HttpHeaders headers, @PathParam("id") String id) {
        return orderServiceProxy.cancelOrder(authHeader(headers), id);
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
