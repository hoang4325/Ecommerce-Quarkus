package com.ecommerce.product.resource;

import com.ecommerce.common.constant.Roles;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.product.dto.CategoryDTO;
import com.ecommerce.product.dto.CreateCategoryRequest;
import com.ecommerce.product.service.CategoryService;
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
import java.util.UUID;

@Path("/api/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Categories", description = "Category management endpoints")
public class CategoryResource {

    @Inject
    CategoryService categoryService;

    @GET
    @PermitAll
    @Operation(summary = "List all categories")
    public ApiResponse<List<CategoryDTO>> listAll() {
        return ApiResponse.success(categoryService.findAll());
    }

    @GET
    @Path("/{id}")
    @PermitAll
    @Operation(summary = "Get category by ID")
    public ApiResponse<CategoryDTO> getById(@PathParam("id") UUID id) {
        return ApiResponse.success(categoryService.findById(id));
    }

    @POST
    @RolesAllowed(Roles.ADMIN)
    @Operation(summary = "Create a new category (ADMIN only)")
    public Response create(@Valid CreateCategoryRequest request) {
        CategoryDTO created = categoryService.create(request);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Category created", created))
                .build();
    }
}
