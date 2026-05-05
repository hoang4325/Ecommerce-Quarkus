package com.ecommerce.gateway.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.UUID;

@RegisterRestClient(configKey = "inventory-service")
@Path("/api/inventory")
public interface InventoryServiceProxy {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    Response list(@HeaderParam("Authorization") String token);

    @GET
    @Path("/product/{productId}/available")
    @Produces(MediaType.APPLICATION_JSON)
    Response getAvailable(@PathParam("productId") UUID productId);

    @GET
    @Path("/product/{productId}")
    @Produces(MediaType.APPLICATION_JSON)
    Response getByProduct(@HeaderParam("Authorization") String token, @PathParam("productId") UUID productId);

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    Response create(@HeaderParam("Authorization") String token, Object body);

    @PUT
    @Path("/product/{productId}")
    @Produces(MediaType.APPLICATION_JSON)
    Response updateStock(
            @HeaderParam("Authorization") String token,
            @PathParam("productId") UUID productId,
            @QueryParam("quantity") int quantity);
}
