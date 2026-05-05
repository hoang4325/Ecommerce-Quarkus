package com.ecommerce.inventory.resource;

import com.ecommerce.common.constant.Roles;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.inventory.dto.CreateInventoryRequest;
import com.ecommerce.inventory.dto.InventoryDTO;
import com.ecommerce.inventory.service.InventoryService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/api/inventory")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Inventory", description = "Stock management")
public class InventoryResource {

    @Inject InventoryService inventoryService;

    @GET
    @RolesAllowed(Roles.ADMIN)
    @Operation(summary = "List all inventory records (ADMIN)")
    public ApiResponse<List<InventoryDTO>> list() {
        return ApiResponse.success(inventoryService.findAll());
    }

    /**
     * Public endpoint: returns available quantity only.
     * No sensitive stock details exposed.
     */
    @GET
    @Path("/product/{productId}/available")
    @PermitAll
    @Operation(summary = "Get available quantity for a product (public)")
    public ApiResponse<Map<String, Object>> getAvailable(@PathParam("productId") UUID productId) {
        try {
            InventoryDTO inv = inventoryService.findByProductId(productId);
            return ApiResponse.success(Map.of("productId", productId.toString(), "available", inv.getAvailable()));
        } catch (Exception e) {
            // Product has no inventory record yet — treat as unknown
            return ApiResponse.success(Map.of("productId", productId.toString(), "available", -1));
        }
    }

    /** Full inventory detail — requires USER or ADMIN */
    @GET
    @Path("/product/{productId}")
    @RolesAllowed({Roles.USER, Roles.ADMIN})
    @Operation(summary = "Get full inventory by product ID (USER+ADMIN)")
    public ApiResponse<InventoryDTO> getByProduct(@PathParam("productId") UUID productId) {
        return ApiResponse.success(inventoryService.findByProductId(productId));
    }

    @POST
    @RolesAllowed(Roles.ADMIN)
    @Operation(summary = "Create inventory entry for a product (ADMIN)")
    public Response create(@Valid CreateInventoryRequest request) {
        InventoryDTO created = inventoryService.create(request);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Inventory created", created))
                .build();
    }

    @PUT
    @Path("/product/{productId}")
    @RolesAllowed(Roles.ADMIN)
    @Operation(summary = "Update stock quantity for a product (ADMIN)")
    public ApiResponse<InventoryDTO> updateStock(
            @PathParam("productId") UUID productId,
            @QueryParam("quantity") int quantity) {
        return ApiResponse.success("Stock updated", inventoryService.updateStock(productId, quantity));
    }
}
