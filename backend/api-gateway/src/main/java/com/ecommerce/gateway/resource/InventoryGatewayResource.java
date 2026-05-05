package com.ecommerce.gateway.resource;

import com.ecommerce.gateway.client.InventoryServiceProxy;
import jakarta.annotation.security.PermitAll;
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

import java.util.UUID;

@Path("/api/inventory")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Inventory (via Gateway)", description = "Proxied to inventory-service")
public class InventoryGatewayResource {

    @Inject
    @RestClient
    InventoryServiceProxy inventoryServiceProxy;

    @GET
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "List all inventory records")
    public Response list(@Context HttpHeaders headers) {
        return inventoryServiceProxy.list(authHeader(headers));
    }

    /** Public: returns only available quantity — safe for anyone */
    @GET
    @Path("/product/{productId}/available")
    @PermitAll
    @Operation(summary = "Get available quantity for a product (public)")
    public Response getAvailable(@PathParam("productId") UUID productId) {
        return inventoryServiceProxy.getAvailable(productId);
    }

    @GET
    @Path("/product/{productId}")
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Get full inventory by product ID (USER+ADMIN)")
    public Response getByProduct(@Context HttpHeaders headers, @PathParam("productId") UUID productId) {
        return inventoryServiceProxy.getByProduct(authHeader(headers), productId);
    }

    @POST
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Create inventory entry for a product")
    public Response create(@Context HttpHeaders headers, Object body) {
        return inventoryServiceProxy.create(authHeader(headers), body);
    }

    @PUT
    @Path("/product/{productId}")
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Update stock quantity for a product")
    public Response updateStock(
            @Context HttpHeaders headers,
            @PathParam("productId") UUID productId,
            @QueryParam("quantity") int quantity) {
        return inventoryServiceProxy.updateStock(authHeader(headers), productId, quantity);
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
