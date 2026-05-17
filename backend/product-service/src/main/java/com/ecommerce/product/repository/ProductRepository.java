package com.ecommerce.product.repository;

import com.ecommerce.product.entity.Product;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ProductRepository implements PanacheRepositoryBase<Product, UUID> {

    public PanacheQuery<Product> findAllActive(
            Page page,
            String search,
            UUID categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String color,
            String productSize,
            String dressStyle,
            String sort
    ) {
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

        if (minPrice != null) {
            query.append(" and price >= :minPrice");
            params.and("minPrice", minPrice);
        }

        if (maxPrice != null) {
            query.append(" and price <= :maxPrice");
            params.and("maxPrice", maxPrice);
        }

        if (color != null && !color.isBlank()) {
            query.append(" and lower(color) = lower(:color)");
            params.and("color", color.trim());
        }

        if (productSize != null && !productSize.isBlank()) {
            query.append(" and lower(productSize) = lower(:productSize)");
            params.and("productSize", productSize.trim());
        }

        if (dressStyle != null && !dressStyle.isBlank()) {
            query.append(" and lower(dressStyle) = lower(:dressStyle)");
            params.and("dressStyle", dressStyle.trim());
        }

        return find(query.toString(), resolveSort(sort), params).page(page);
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by("createdAt").descending();
        }

        return switch (sort.trim().toLowerCase()) {
            case "price_asc", "price-asc", "priceasc" -> Sort.by("price").ascending();
            case "price_desc", "price-desc", "pricedesc" -> Sort.by("price").descending();
            case "name_asc", "name-asc", "nameasc" -> Sort.by("name").ascending();
            case "name_desc", "name-desc", "namedesc" -> Sort.by("name").descending();
            case "oldest" -> Sort.by("createdAt").ascending();
            case "popular", "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("createdAt").descending();
        };
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
