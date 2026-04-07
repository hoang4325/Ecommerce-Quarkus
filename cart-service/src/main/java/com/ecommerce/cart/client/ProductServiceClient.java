package com.ecommerce.cart.client;

import com.ecommerce.common.dto.ApiResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.UUID;

/**
 * REST client for calling product-service to validate products when adding to cart.
 */
@RegisterRestClient(configKey = "product-service")
@Produces(MediaType.APPLICATION_JSON)
@Path("/api/products")
public interface ProductServiceClient {

    @GET
    @Path("/{id}")
    ApiResponse<ProductInfo> getProduct(@PathParam("id") UUID id);

    /** Minimal product info needed by cart-service */
    record ProductInfo(
            UUID id,
            String name,
            java.math.BigDecimal price,
            boolean active
    ) {}
}
