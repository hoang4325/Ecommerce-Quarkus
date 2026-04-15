package com.ecommerce.order.repository;

import com.ecommerce.order.entity.Order;
import com.ecommerce.order.entity.OrderStatus;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class OrderRepository implements PanacheRepositoryBase<Order, UUID> {

    public List<Order> findByUserId(UUID userId) {
        return find("userId = ?1", Sort.by("createdAt").descending(), userId).list();
    }

    public PanacheQuery<Order> findAllPaged(Page page, OrderStatus status) {
        if (status != null) {
            return find("status = ?1", Sort.by("createdAt").descending(), status).page(page);
        }
        return findAll(Sort.by("createdAt").descending()).page(page);
    }
}
