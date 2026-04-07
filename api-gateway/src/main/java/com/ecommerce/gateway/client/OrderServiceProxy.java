package com.ecommerce.gateway.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * Proxy client for order-service.
 */
@RegisterRestClient(configKey = "order-service")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface OrderServiceProxy {

    @POST
    @Path("/api/orders")
    Response createOrder(@HeaderParam("Authorization") String auth, Object body);

    @GET
    @Path("/api/orders")
    Response getOrders(@HeaderParam("Authorization") String auth);

    @GET
    @Path("/api/orders/{id}")
    Response getOrder(
            @HeaderParam("Authorization") String auth,
            @PathParam("id") String id
    );

    @PUT
    @Path("/api/orders/{id}/cancel")
    Response cancelOrder(
            @HeaderParam("Authorization") String auth,
            @PathParam("id") String id
    );

    @GET
    @Path("/api/admin/orders")
    Response adminListOrders(
            @HeaderParam("Authorization") String auth,
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size,
            @QueryParam("status") String status
    );

    @PUT
    @Path("/api/admin/orders/{id}/status")
    Response adminUpdateStatus(
            @HeaderParam("Authorization") String auth,
            @PathParam("id") String id,
            @QueryParam("status") String status
    );
}
