package com.ecommerce.inventory.repository;

import com.ecommerce.inventory.entity.Inventory;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class InventoryRepository implements PanacheRepositoryBase<Inventory, UUID> {

    public Optional<Inventory> findByProductId(UUID productId) {
        return find("productId", productId).firstResultOptional();
    }
}
