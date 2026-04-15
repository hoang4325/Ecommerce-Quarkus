package com.ecommerce.order.client;

import com.ecommerce.common.dto.ApiResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;
import io.quarkus.oidc.token.propagation.AccessToken;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * REST client for calling cart-service.
 * Used by order-service to fetch cart contents when creating an order.
 */
@RegisterRestClient(configKey = "cart-service")
@AccessToken
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Path("/api/cart")
public interface CartServiceClient {

    @GET
    ApiResponse<CartInfo> getCart();

    @DELETE
    void clearCart();

    record CartItemInfo(UUID id, UUID productId, String productName, BigDecimal price, Integer quantity) {}

    record CartInfo(UUID id, UUID userId, String status, List<CartItemInfo> items, BigDecimal totalAmount) {}
}
