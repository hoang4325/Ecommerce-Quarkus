package com.ecommerce.order.client;

import com.ecommerce.common.dto.ApiResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * REST client for calling product-service.
 * Used by order-service to validate products when creating an order.
 */
@RegisterRestClient(configKey = "product-service")
@Produces(MediaType.APPLICATION_JSON)
@Path("/api/products")
public interface ProductServiceClient {

    @GET
    @Path("/{id}")
    ApiResponse<ProductInfo> getProduct(@PathParam("id") UUID id);

    record ProductInfo(UUID id, String name, BigDecimal price, boolean active) {}
}
