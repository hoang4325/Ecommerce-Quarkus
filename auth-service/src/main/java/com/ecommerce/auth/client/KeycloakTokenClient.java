package com.ecommerce.auth.client;

import com.ecommerce.auth.dto.TokenResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * REST client for Keycloak Token endpoint.
 * Used for:
 *  - Getting admin access token (client_credentials)
 *  - User login (password grant)
 *  - Token refresh
 */
@RegisterRestClient(configKey = "keycloak-token")
@Path("/realms/ecommerce/protocol/openid-connect/token")
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
@Produces(MediaType.APPLICATION_JSON)
public interface KeycloakTokenClient {

    @POST
    TokenResponse getToken(
            @FormParam("grant_type")    String grantType,
            @FormParam("client_id")     String clientId,
            @FormParam("client_secret") String clientSecret,
            @FormParam("username")      String username,
            @FormParam("password")      String password,
            @FormParam("scope")         String scope
    );
}
