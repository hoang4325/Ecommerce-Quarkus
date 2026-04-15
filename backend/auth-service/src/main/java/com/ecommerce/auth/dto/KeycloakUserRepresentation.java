package com.ecommerce.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * Subset of Keycloak Admin API user representation.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class KeycloakUserRepresentation {

    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private boolean enabled;

    @JsonProperty("emailVerified")
    private boolean emailVerified;

    private List<CredentialRepresentation> credentials;

    @Data
    public static class CredentialRepresentation {
        private String type = "password";
        private String value;
        private boolean temporary = false;
    }
}
