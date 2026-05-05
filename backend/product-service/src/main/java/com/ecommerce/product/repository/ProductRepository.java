package com.ecommerce.product.repository;

import com.ecommerce.product.entity.Product;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ProductRepository implements PanacheRepositoryBase<Product, UUID> {

    public PanacheQuery<Product> findAllActive(Page page, String search, UUID categoryId) {
        StringBuilder query = new StringBuilder("active = true");
        io.quarkus.panache.common.Parameters params = new io.quarkus.panache.common.Parameters();

        if (search != null && !search.isBlank()) {
            query.append(" and (lower(name) like lower(:search) or lower(description) like lower(:search))");
            params.and("search", "%" + search.trim() + "%");
        }

        if (categoryId != null) {
            query.append(" and category.id = :categoryId");
            params.and("categoryId", categoryId);
        }

        return find(query.toString(), Sort.by("createdAt").descending(), params).page(page);
    }

    public Optional<Product> findBySlug(String slug) {
        return find("slug", slug).firstResultOptional();
    }

    public boolean existsBySlug(String slug) {
        return count("slug", slug) > 0;
    }

    public boolean existsBySlugAndIdNot(String slug, UUID id) {
        return count("slug = ?1 and id != ?2", slug, id) > 0;
    }
}
