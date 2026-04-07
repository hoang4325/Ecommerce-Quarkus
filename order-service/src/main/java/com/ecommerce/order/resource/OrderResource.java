package com.ecommerce.order.resource;

import com.ecommerce.common.constant.Roles;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.dto.OrderDTO;
import com.ecommerce.order.service.OrderService;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Orders", description = "Order management endpoints")
@SecurityRequirement(name = "JWT")
public class OrderResource {

    @Inject OrderService orderService;
    @Inject SecurityIdentity identity;

    private UUID currentUserId() {
        return UUID.fromString(identity.getPrincipal().getName());
    }

    @POST
    @RolesAllowed({Roles.USER, Roles.ADMIN})
    @Operation(summary = "Create order from active cart")
    public Response create(@Valid CreateOrderRequest request) {
        OrderDTO created = orderService.createFromCart(currentUserId(), request);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Order created", created))
                .build();
    }

    @GET
    @RolesAllowed({Roles.USER, Roles.ADMIN})
    @Operation(summary = "List own orders")
    public ApiResponse<List<OrderDTO>> listMyOrders() {
        return ApiResponse.success(orderService.findByUser(currentUserId()));
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({Roles.USER, Roles.ADMIN})
    @Operation(summary = "Get order by ID (own only)")
    public ApiResponse<OrderDTO> getById(@PathParam("id") UUID id) {
        return ApiResponse.success(orderService.findByIdAndUser(id, currentUserId()));
    }

    @PUT
    @Path("/{id}/cancel")
    @RolesAllowed({Roles.USER, Roles.ADMIN})
    @Operation(summary = "Cancel a PENDING order")
    public ApiResponse<OrderDTO> cancel(@PathParam("id") UUID id) {
        return ApiResponse.success("Order cancelled", orderService.cancel(id, currentUserId()));
    }
}
