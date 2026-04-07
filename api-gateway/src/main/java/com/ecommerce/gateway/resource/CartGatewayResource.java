package com.ecommerce.gateway.resource;

import com.ecommerce.gateway.client.CartServiceProxy;
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

@Path("/api/cart")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Cart (via Gateway)", description = "Proxied to cart-service")
@SecurityRequirement(name = "JWT")
public class CartGatewayResource {

    @Inject
    @RestClient
    CartServiceProxy cartServiceProxy;

    @GET
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Get active cart")
    public Response getCart(@Context HttpHeaders headers) {
        return cartServiceProxy.getCart(authHeader(headers));
    }

    @POST
    @Path("/items")
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Add item to cart")
    public Response addItem(@Context HttpHeaders headers, Object body) {
        return cartServiceProxy.addItem(authHeader(headers), body);
    }

    @PUT
    @Path("/items/{itemId}")
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Update cart item quantity")
    public Response updateItem(
            @Context HttpHeaders headers,
            @PathParam("itemId") String itemId,
            Object body) {
        return cartServiceProxy.updateItem(authHeader(headers), itemId, body);
    }

    @DELETE
    @Path("/items/{itemId}")
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Remove item from cart")
    public Response removeItem(@Context HttpHeaders headers, @PathParam("itemId") String itemId) {
        return cartServiceProxy.removeItem(authHeader(headers), itemId);
    }

    @DELETE
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Clear cart")
    public Response clearCart(@Context HttpHeaders headers) {
        return cartServiceProxy.clearCart(authHeader(headers));
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
