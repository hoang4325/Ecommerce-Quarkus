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

    public PanacheQuery<Product> findAllActive(Page page, String search) {
        if (search != null && !search.isBlank()) {
            return find("active = true and (lower(name) like lower(?1) or lower(description) like lower(?1))",
                    Sort.by("createdAt").descending(),
                    "%" + search.trim() + "%")
                    .page(page);
        }
        return find("active = true", Sort.by("createdAt").descending()).page(page);
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
