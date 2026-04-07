package com.ecommerce.auth.resource;

import com.ecommerce.auth.dto.*;
import com.ecommerce.auth.service.AuthService;
import com.ecommerce.common.dto.ApiResponse;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Register, login, and user info endpoints")
public class AuthResource {

    @Inject AuthService authService;
    @Inject SecurityIdentity identity;

    @POST
    @Path("/register")
    @PermitAll
    @Operation(summary = "Register a new user account")
    public Response register(@Valid RegisterRequest request) {
        UserInfoDTO user = authService.register(request);
        return Response.status(Response.Status.CREATED)
                .entity(ApiResponse.success("Account created successfully. You can now login.", user))
                .build();
    }

    @POST
    @Path("/login")
    @PermitAll
    @Operation(summary = "Login — returns access token and refresh token")
    public ApiResponse<TokenResponse> login(@Valid LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @POST
    @Path("/refresh")
    @PermitAll
    @Operation(summary = "Refresh access token using refresh token")
    public ApiResponse<TokenResponse> refresh(@HeaderParam("X-Refresh-Token") String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("X-Refresh-Token header is required");
        }
        return ApiResponse.success(authService.refreshToken(refreshToken));
    }

    @GET
    @Path("/me")
    @RolesAllowed({"USER", "ADMIN"})
    @SecurityRequirement(name = "JWT")
    @Operation(summary = "Get current user info from token")
    public ApiResponse<UserInfoDTO> me() {
        String userId = identity.getPrincipal().getName();
        return ApiResponse.success(authService.getUserInfo(userId));
    }

    @GET
    @Path("/health")
    @PermitAll
    @Operation(summary = "Auth service health check")
    public ApiResponse<String> health() {
        return ApiResponse.success("auth-service is running");
    }
}
