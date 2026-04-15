package com.ecommerce.gateway.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * Proxy client for cart-service.
 */
@RegisterRestClient(configKey = "cart-service")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface CartServiceProxy {

    @GET
    @Path("/api/cart")
    Response getCart(@HeaderParam("Authorization") String auth);

    @POST
    @Path("/api/cart/items")
    Response addItem(@HeaderParam("Authorization") String auth, Object body);

    @PUT
    @Path("/api/cart/items/{itemId}")
    Response updateItem(
            @HeaderParam("Authorization") String auth,
            @PathParam("itemId") String itemId,
            Object body
    );

    @DELETE
    @Path("/api/cart/items/{itemId}")
    Response removeItem(
            @HeaderParam("Authorization") String auth,
            @PathParam("itemId") String itemId
    );

    @DELETE
    @Path("/api/cart")
    Response clearCart(@HeaderParam("Authorization") String auth);
}
