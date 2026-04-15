package com.ecommerce.user.repository;

import com.ecommerce.user.entity.UserProfile;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserProfileRepository implements PanacheRepositoryBase<UserProfile, UUID> {
    public Optional<UserProfile> findByEmail(String email) {
        return find("email", email).firstResultOptional();
    }
}
