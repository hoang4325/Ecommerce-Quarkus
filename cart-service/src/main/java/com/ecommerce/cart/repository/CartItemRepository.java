package com.ecommerce.cart.repository;

import com.ecommerce.cart.entity.CartItem;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.UUID;

@ApplicationScoped
public class CartItemRepository implements PanacheRepositoryBase<CartItem, UUID> {
}
