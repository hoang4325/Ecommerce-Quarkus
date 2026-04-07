package com.ecommerce.payment.resource;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.repository.PaymentRepository;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/payments")
@Produces(MediaType.APPLICATION_JSON)
@Tag(name = "Payments", description = "Payment records")
public class PaymentResource {

    @Inject PaymentRepository paymentRepository;

    @GET
    @RolesAllowed("ADMIN")
    public ApiResponse<List<Payment>> listAll() {
        return ApiResponse.success(paymentRepository.listAll());
    }

    @GET
    @Path("/order/{orderId}")
    @RolesAllowed({"USER", "ADMIN"})
    public ApiResponse<Payment> getByOrder(@PathParam("orderId") UUID orderId) {
        return ApiResponse.success(paymentRepository.findByOrderId(orderId).orElse(null));
    }
}
