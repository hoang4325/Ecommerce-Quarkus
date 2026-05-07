package com.ecommerce.gateway.client;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "payment-service")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public interface PaymentServiceProxy {

    @GET
    @Path("/api/payments")
    Response listAll(@HeaderParam("Authorization") String auth);

    @GET
    @Path("/api/payments/order/{orderId}")
    Response getByOrder(
            @HeaderParam("Authorization") String auth,
            @PathParam("orderId") String orderId
    );
}
