package com.ecommerce.gateway.resource;

import com.ecommerce.gateway.client.ProductServiceProxy;
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

/**
 * Gateway route for product-service.
 * Validates OIDC token (Quarkus OIDC does this automatically based on @RolesAllowed / @Authenticated).
 * Forwards Authorization header to downstream product-service.
 */
@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Products (via Gateway)", description = "Proxied to product-service")
public class ProductGatewayResource {

    @Inject
    @RestClient
    ProductServiceProxy productServiceProxy;

    @GET
    @PermitAll
    @Operation(summary = "List products")
    public Response list(
            @Context HttpHeaders headers,
            @QueryParam("page") @DefaultValue("0") Integer page,
            @QueryParam("size") @DefaultValue("10") Integer size,
            @QueryParam("search") String search) {
        return productServiceProxy.getProducts(authHeader(headers), page, size, search);
    }

    @GET
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "Get product by ID")
    public Response getById(@Context HttpHeaders headers, @PathParam("id") String id) {
        return productServiceProxy.getProduct(authHeader(headers), id);
    }

    @POST
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Create product (ADMIN)")
    public Response create(@Context HttpHeaders headers, Object body) {
        return productServiceProxy.createProduct(authHeader(headers), body);
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Update product (ADMIN)")
    public Response update(@Context HttpHeaders headers, @PathParam("id") String id, Object body) {
        return productServiceProxy.updateProduct(authHeader(headers), id, body);
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Delete product (ADMIN)")
    public Response delete(@Context HttpHeaders headers, @PathParam("id") String id) {
        return productServiceProxy.deleteProduct(authHeader(headers), id);
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
