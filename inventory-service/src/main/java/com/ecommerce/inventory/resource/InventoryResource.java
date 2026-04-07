package com.ecommerce.inventory.resource;

import com.ecommerce.common.constant.Roles;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.inventory.dto.CreateInventoryRequest;
import com.ecommerce.inventory.dto.InventoryDTO;
import com.ecommerce.inventory.service.InventoryService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@Path("/api/inventory")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed(Roles.ADMIN)
@Tag(name = "Inventory", description = "Stock management (ADMIN only)")
public class InventoryResource {

    @Inject InventoryService inventoryService;

    @GET
    @Operation(summary = "List all inventory records")
    public ApiResponse<List<InventoryDTO>> list() {
        return ApiResponse.success(inventoryService.findAll());
    }

    @GET
    @Path("/product/{productId}")
    @Operation(summary = "Get inventory by product ID")
    public ApiResponse<InventoryDTO> getByProduct(@PathParam("productId") UUID productId) {
        return ApiResponse.success(inventoryService.findByProductId(productId));
    }

    @POST
    @Operation(summary = "Create inventory entry for a product")
    public Response create(@Valid CreateInventoryRequest request) {
        InventoryDTO created = inventoryService.create(request);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Inventory created", created))
                .build();
    }

    @PUT
    @Path("/product/{productId}")
    @Operation(summary = "Update stock quantity for a product")
    public ApiResponse<InventoryDTO> updateStock(
            @PathParam("productId") UUID productId,
            @QueryParam("quantity") int quantity) {
        return ApiResponse.success("Stock updated", inventoryService.updateStock(productId, quantity));
    }
}
