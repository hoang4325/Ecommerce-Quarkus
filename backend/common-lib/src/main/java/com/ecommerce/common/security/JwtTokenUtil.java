package com.ecommerce.common.security;

import io.smallrye.jwt.build.Jwt;

import java.time.Duration;
import java.util.Set;
import java.util.UUID;

/**
 * DEV-ONLY JWT token generator.
 *
 * Generates self-signed JWT tokens for local development and testing.
 * This utility uses a hardcoded RSA private key — DO NOT USE IN PRODUCTION.
 *
 * Usage:
 *   Generate USER token:  JwtTokenUtil.generateToken("user-123", Set.of("USER"))
 *   Generate ADMIN token: JwtTokenUtil.generateToken("admin-1", Set.of("USER", "ADMIN"))
 *
 * Run from command line:
 *   cd common-lib
 *   mvn exec:java -Dexec.mainClass="com.ecommerce.common.security.JwtTokenUtil" -Dexec.args="USER"
 */
public class JwtTokenUtil {

    /** Duration for dev tokens — 24 hours */
    private static final Duration TOKEN_TTL = Duration.ofHours(24);

    /** Fixed dev user IDs for testing */
    public static final String DEV_USER_ID = "550e8400-e29b-41d4-a716-446655440001";
    public static final String DEV_ADMIN_ID = "550e8400-e29b-41d4-a716-446655440002";
    public static final String DEV_ISSUER = "https://ecommerce-dev";

    /**
     * Generate a signed JWT for the given subject and roles.
     * The private key is read from the classpath resource "privateKey.pem".
     *
     * @param subject user ID (UUID as string)
     * @param roles   set of role strings (e.g., "USER", "ADMIN")
     * @return signed JWT string
     */
    public static String generateToken(String subject, Set<String> roles) {
        return Jwt.issuer(DEV_ISSUER)
                .subject(subject)
                .groups(roles)
                .claim("typ", "Bearer")
                .expiresIn(TOKEN_TTL)
                .sign();
    }

    /**
     * CLI entry point. Prints a token to stdout.
     * Args: USER | ADMIN
     */
    public static void main(String[] args) {
        String role = (args.length > 0) ? args[0].toUpperCase() : "USER";

        String subject;
        Set<String> roles;

        if ("ADMIN".equals(role)) {
            subject = DEV_ADMIN_ID;
            roles = Set.of("USER", "ADMIN");
        } else {
            subject = DEV_USER_ID;
            roles = Set.of("USER");
        }

        String token = generateToken(subject, roles);
        System.out.println("============================");
        System.out.println("Role: " + role);
        System.out.println("Subject: " + subject);
        System.out.println("Token (valid 24h):");
        System.out.println(token);
        System.out.println("============================");
        System.out.println("Authorization header:");
        System.out.println("Bearer " + token);
        System.out.println("============================");
    }
}
