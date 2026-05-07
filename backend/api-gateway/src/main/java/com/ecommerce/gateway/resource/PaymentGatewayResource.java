package com.ecommerce.gateway.resource;

import com.ecommerce.gateway.client.PaymentServiceProxy;
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

@Path("/api/payments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Payments (via Gateway)", description = "Proxied to payment-service")
public class PaymentGatewayResource {

    @Inject
    @RestClient
    PaymentServiceProxy paymentServiceProxy;

    @GET
    @RolesAllowed("ADMIN")
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "List payments")
    public Response listAll(@Context HttpHeaders headers) {
        return paymentServiceProxy.listAll(authHeader(headers));
    }

    @GET
    @Path("/order/{orderId}")
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Get payment by order ID")
    public Response getByOrder(@Context HttpHeaders headers, @PathParam("orderId") String orderId) {
        return paymentServiceProxy.getByOrder(authHeader(headers), orderId);
    }

    private String authHeader(HttpHeaders headers) {
        String auth = headers.getHeaderString(HttpHeaders.AUTHORIZATION);
        return auth != null ? auth : "";
    }
}
