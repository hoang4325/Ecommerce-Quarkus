package com.ecommerce.order.resource;

import com.ecommerce.common.constant.Roles;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.order.dto.OrderDTO;
import com.ecommerce.order.entity.OrderStatus;
import com.ecommerce.order.service.OrderService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/admin/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed(Roles.ADMIN)
@Tag(name = "Orders Admin", description = "Admin order management")
@SecurityRequirement(name = "JWT")
public class OrderAdminResource {

    @Inject
    OrderService orderService;

    @GET
    @Operation(summary = "List all orders with optional status filter (ADMIN)")
    public ApiResponse<PagedResponse<OrderDTO>> listAll(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size,
            @QueryParam("status") OrderStatus status) {
        return ApiResponse.success(orderService.findAllPaged(page, size, status));
    }

    @PUT
    @Path("/{id}/status")
    @Operation(summary = "Update order status (ADMIN)")
    public ApiResponse<OrderDTO> updateStatus(
            @PathParam("id") UUID id,
            @QueryParam("status") OrderStatus status) {
        return ApiResponse.success("Order status updated", orderService.updateStatus(id, status));
    }
}
