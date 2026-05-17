package com.ecommerce.product.repository;

import com.ecommerce.product.entity.ProductReview;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class ProductReviewRepository implements PanacheRepositoryBase<ProductReview, UUID> {

    public PanacheQuery<ProductReview> findByProductId(UUID productId, Page page) {
        return find("product.id = ?1", Sort.by("createdAt").descending(), productId).page(page);
    }

    public Optional<ProductReview> findByProductIdAndUserId(UUID productId, UUID userId) {
        return find("product.id = ?1 and userId = ?2", productId, userId).firstResultOptional();
    }

    public Optional<ProductReview> findByIdAndProductId(UUID reviewId, UUID productId) {
        return find("id = ?1 and product.id = ?2", reviewId, productId).firstResultOptional();
    }

    public long countByProductId(UUID productId) {
        return count("product.id = ?1", productId);
    }

    public long countByProductIdAndRating(UUID productId, int rating) {
        return count("product.id = ?1 and rating = ?2", productId, rating);
    }

    public double averageRating(UUID productId) {
        Double average = getEntityManager()
                .createQuery(
                        "select avg(r.rating) from ProductReview r where r.product.id = :productId",
                        Double.class
                )
                .setParameter("productId", productId)
                .getSingleResult();
        return average == null ? 0.0 : average;
    }
}
