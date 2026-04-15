package com.ecommerce.gateway.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * Proxy client for product-service.
 * The gateway forwards the request as-is, passing the Authorization header.
 */
@RegisterRestClient(configKey = "product-service")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface ProductServiceProxy {

    @GET
    @Path("/api/products")
    Response getProducts(
            @HeaderParam("Authorization") String auth,
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size,
            @QueryParam("search") String search
    );

    @GET
    @Path("/api/products/{id}")
    Response getProduct(
            @HeaderParam("Authorization") String auth,
            @PathParam("id") String id
    );

    @POST
    @Path("/api/products")
    Response createProduct(
            @HeaderParam("Authorization") String auth,
            Object body
    );

    @PUT
    @Path("/api/products/{id}")
    Response updateProduct(
            @HeaderParam("Authorization") String auth,
            @PathParam("id") String id,
            Object body
    );

    @DELETE
    @Path("/api/products/{id}")
    Response deleteProduct(
            @HeaderParam("Authorization") String auth,
            @PathParam("id") String id
    );

    @GET
    @Path("/api/categories")
    Response getCategories(@HeaderParam("Authorization") String auth);

    @GET
    @Path("/api/categories/{id}")
    Response getCategory(
            @HeaderParam("Authorization") String auth,
            @PathParam("id") String id
    );

    @POST
    @Path("/api/categories")
    Response createCategory(
            @HeaderParam("Authorization") String auth,
            Object body
    );
}
