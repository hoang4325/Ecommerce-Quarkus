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

@Path("/api/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Categories (via Gateway)", description = "Proxied to product-service")
public class CategoryGatewayResource {

    @Inject
    @RestClient
    ProductServiceProxy productServiceProxy;

    @GET
    @PermitAll
    @Operation(summary = "List all categories")
    public Response list(@Context HttpHeaders headers) {
        return productServiceProxy.getCategories(authHeader(headers));
    }

    @POST
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Create category (ADMIN)")
    public Response create(@Context HttpHeaders headers, Object body) {
        return productServiceProxy.createCategory(authHeader(headers), body);
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
