package com.ecommerce.cart.repository;

import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class CartRepository implements PanacheRepositoryBase<Cart, UUID> {

    public Optional<Cart> findActiveByUserId(UUID userId) {
        return find("userId = ?1 and status = ?2", userId, CartStatus.ACTIVE)
                .firstResultOptional();
    }
}
