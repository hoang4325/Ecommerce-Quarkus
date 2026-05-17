package com.ecommerce.product.resource;

import com.ecommerce.common.constant.Roles;
import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.product.dto.CreateProductReviewRequest;
import com.ecommerce.product.dto.ProductRatingSummaryDTO;
import com.ecommerce.product.dto.ProductReviewDTO;
import com.ecommerce.product.dto.UpdateProductReviewRequest;
import com.ecommerce.product.service.ProductReviewService;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Product Reviews", description = "Product rating and review endpoints")
public class ProductReviewResource {

    @Inject ProductReviewService productReviewService;
    @Inject JsonWebToken jwt;
    @Inject SecurityIdentity identity;

    @GET
    @Path("/{productId}/reviews")
    @PermitAll
    @Operation(summary = "List product reviews")
    public ApiResponse<PagedResponse<ProductReviewDTO>> listReviews(
            @PathParam("productId") UUID productId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("10") int size) {
        return ApiResponse.success(productReviewService.listReviews(productId, page, size));
    }

    @GET
    @Path("/{productId}/rating-summary")
    @PermitAll
    @Operation(summary = "Get product rating summary")
    public ApiResponse<ProductRatingSummaryDTO> getRatingSummary(@PathParam("productId") UUID productId) {
        return ApiResponse.success(productReviewService.getRatingSummary(productId));
    }

    @POST
    @Path("/{productId}/reviews")
    @RolesAllowed({Roles.USER, Roles.ADMIN})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Create current user's product review")
    public Response createReview(
            @PathParam("productId") UUID productId,
            @Valid CreateProductReviewRequest request) {
        ProductReviewDTO created = productReviewService.createReview(
                productId,
                request,
                currentUserId(),
                currentUserName()
        );
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Review created", created))
                .build();
    }

    @PUT
    @Path("/{productId}/reviews/{reviewId}")
    @RolesAllowed({Roles.USER, Roles.ADMIN})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Update own product review, or any review as ADMIN")
    public ApiResponse<ProductReviewDTO> updateReview(
            @PathParam("productId") UUID productId,
            @PathParam("reviewId") UUID reviewId,
            @Valid UpdateProductReviewRequest request) {
        return ApiResponse.success(
                "Review updated",
                productReviewService.updateReview(productId, reviewId, request, currentUserId(), isAdmin())
        );
    }

    @DELETE
    @Path("/{productId}/reviews/{reviewId}")
    @RolesAllowed({Roles.USER, Roles.ADMIN})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Delete own product review, or any review as ADMIN")
    public Response deleteReview(
            @PathParam("productId") UUID productId,
            @PathParam("reviewId") UUID reviewId) {
        productReviewService.deleteReview(productId, reviewId, currentUserId(), isAdmin());
        return Response.noContent().build();
    }

    private UUID currentUserId() {
        return UUID.fromString(jwt.getSubject());
    }

    private boolean isAdmin() {
        return identity.hasRole(Roles.ADMIN);
    }

    private String currentUserName() {
        String name = claimAsString("name");
        if (name != null && !name.isBlank()) {
            return name;
        }

        String firstName = claimAsString("given_name");
        String lastName = claimAsString("family_name");
        String fullName = ((firstName == null ? "" : firstName) + " " + (lastName == null ? "" : lastName)).trim();
        if (!fullName.isBlank()) {
            return fullName;
        }

        String username = claimAsString("preferred_username");
        if (username != null && !username.isBlank()) {
            return username;
        }

        String email = claimAsString("email");
        return email == null || email.isBlank() ? "Customer" : email;
    }

    private String claimAsString(String claimName) {
        Object claim = jwt.getClaim(claimName);
        return claim == null ? null : String.valueOf(claim);
    }
}
