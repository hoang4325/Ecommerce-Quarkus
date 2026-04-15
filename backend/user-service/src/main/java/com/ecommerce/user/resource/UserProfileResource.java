package com.ecommerce.user.resource;

import com.ecommerce.common.dto.ApiResponse;
import com.ecommerce.user.dto.UpdateProfileRequest;
import com.ecommerce.user.dto.UserProfileDTO;
import com.ecommerce.user.service.UserProfileService;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "User Profile")
public class UserProfileResource {

    @Inject UserProfileService userProfileService;
    @Inject SecurityIdentity identity;
    @Inject org.eclipse.microprofile.jwt.JsonWebToken jwt;

    private UUID currentUserId() {
        return UUID.fromString(jwt.getSubject());
    }

    @GET
    @Path("/me")
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Get or create own profile (auto-creates from OIDC claims if not exists)")
    public ApiResponse<UserProfileDTO> getMyProfile() {
        String email = jwt.getClaim("email");
        String firstName = jwt.getClaim("given_name");
        String lastName = jwt.getClaim("family_name");
        return ApiResponse.success(
                userProfileService.getOrCreateProfile(currentUserId(), email, firstName, lastName)
        );
    }

    @PUT
    @Path("/me")
    @RolesAllowed({"USER", "ADMIN"})
    @Operation(summary = "Update own profile")
    public ApiResponse<UserProfileDTO> updateMyProfile(@Valid UpdateProfileRequest request) {
        return ApiResponse.success("Profile updated", userProfileService.updateProfile(currentUserId(), request));
    }

    @GET
    @Path("/{userId}")
    @RolesAllowed("ADMIN")
    @Operation(summary = "Get user profile by ID (ADMIN)")
    public ApiResponse<UserProfileDTO> getById(@PathParam("userId") UUID userId) {
        return ApiResponse.success(userProfileService.getProfile(userId));
    }
}
