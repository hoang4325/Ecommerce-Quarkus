package com.ecommerce.product.resource;

import com.ecommerce.common.constant.Roles;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.product.dto.CreateProductRequest;
import com.ecommerce.product.dto.ProductDTO;
import com.ecommerce.product.dto.UpdateProductRequest;
import com.ecommerce.product.service.ProductService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.util.UUID;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Products", description = "Product management endpoints")
public class ProductResource {

    private static final Logger LOG = Logger.getLogger(ProductResource.class);

    @Inject
    ProductService productService;

    @GET
    @PermitAll
    @Operation(summary = "List all active products with advanced filters")
    public ApiResponse<PagedResponse<ProductDTO>> list(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size,
            @QueryParam("search") String search,
            @QueryParam("categoryId") UUID categoryId,
            @QueryParam("minPrice") BigDecimal minPrice,
            @QueryParam("maxPrice") BigDecimal maxPrice,
            @QueryParam("color") String color,
            @QueryParam("productSize") String productSize,
            @QueryParam("dressStyle") String dressStyle,
            @QueryParam("style") String style,
            @QueryParam("sort") String sort) {
        String resolvedDressStyle = dressStyle != null && !dressStyle.isBlank() ? dressStyle : style;
        return ApiResponse.success(productService.findAll(
                page,
                size,
                search,
                categoryId,
                minPrice,
                maxPrice,
                color,
                productSize,
                resolvedDressStyle,
                sort
        ));
    }

    @GET
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "Get product by ID")
    public ApiResponse<ProductDTO> getById(@PathParam("id") UUID id) {
        LOG.infof("Fetching product by ID: %s", id);
        return ApiResponse.success(productService.findById(id));
    }

    @POST
    @RolesAllowed(Roles.ADMIN)
    @Operation(summary = "Create a new product (ADMIN only)")
    public Response create(@Valid CreateProductRequest request) {
        ProductDTO created = productService.create(request);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Product created", created))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed(Roles.ADMIN)
    @Operation(summary = "Update a product (ADMIN only)")
    public ApiResponse<ProductDTO> update(
            @PathParam("id") UUID id,
            @Valid UpdateProductRequest request) {
        return ApiResponse.success("Product updated", productService.update(id, request));
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed(Roles.ADMIN)
    @Operation(summary = "Soft-delete a product (ADMIN only)")
    public Response delete(@PathParam("id") UUID id) {
        productService.delete(id);
        return Response.noContent().build();
    }
}
