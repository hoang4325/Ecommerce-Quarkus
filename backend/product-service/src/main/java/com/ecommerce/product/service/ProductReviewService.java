package com.ecommerce.product.service;

import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.dto.CreateProductReviewRequest;
import com.ecommerce.product.dto.ProductRatingSummaryDTO;
import com.ecommerce.product.dto.ProductReviewDTO;
import com.ecommerce.product.dto.UpdateProductReviewRequest;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductReview;
import com.ecommerce.product.repository.ProductRepository;
import com.ecommerce.product.repository.ProductReviewRepository;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class ProductReviewService {

    @Inject ProductRepository productRepository;
    @Inject ProductReviewRepository reviewRepository;

    public PagedResponse<ProductReviewDTO> listReviews(UUID productId, int page, int size) {
        ensureActiveProduct(productId);
        Page pageRequest = Page.of(page, size);
        var query = reviewRepository.findByProductId(productId, pageRequest);
        long total = query.count();
        var reviews = query.list().stream().map(this::toDTO).toList();
        return PagedResponse.of(reviews, page, size, total);
    }

    public ProductRatingSummaryDTO getRatingSummary(UUID productId) {
        ensureActiveProduct(productId);

        Map<Integer, Long> counts = new LinkedHashMap<>();
        for (int rating = 5; rating >= 1; rating--) {
            counts.put(rating, reviewRepository.countByProductIdAndRating(productId, rating));
        }

        double average = reviewRepository.averageRating(productId);
        double roundedAverage = BigDecimal.valueOf(average)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();

        return ProductRatingSummaryDTO.builder()
                .productId(productId)
                .averageRating(roundedAverage)
                .reviewCount(reviewRepository.countByProductId(productId))
                .ratingCounts(counts)
                .build();
    }

    @Transactional
    public ProductReviewDTO createReview(
            UUID productId,
            CreateProductReviewRequest request,
            UUID userId,
            String userName
    ) {
        Product product = ensureActiveProduct(productId);
        reviewRepository.findByProductIdAndUserId(productId, userId)
                .ifPresent(review -> {
                    throw new BusinessException("You have already reviewed this product");
                });

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUserId(userId);
        review.setUserName(userName);
        review.setRating(request.getRating());
        review.setComment(normalizeComment(request.getComment()));

        reviewRepository.persist(review);
        return toDTO(review);
    }

    @Transactional
    public ProductReviewDTO updateReview(
            UUID productId,
            UUID reviewId,
            UpdateProductReviewRequest request,
            UUID userId,
            boolean admin
    ) {
        ProductReview review = findReview(productId, reviewId);
        ensureCanModify(review, userId, admin);

        if (request.getRating() == null && request.getComment() == null) {
            throw new BusinessException("Rating or comment is required");
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            review.setComment(normalizeComment(request.getComment()));
        }

        return toDTO(review);
    }

    @Transactional
    public void deleteReview(UUID productId, UUID reviewId, UUID userId, boolean admin) {
        ProductReview review = findReview(productId, reviewId);
        ensureCanModify(review, userId, admin);
        reviewRepository.delete(review);
    }

    private Product ensureActiveProduct(UUID productId) {
        return productRepository.findByIdOptional(productId)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
    }

    private ProductReview findReview(UUID productId, UUID reviewId) {
        ensureActiveProduct(productId);
        return reviewRepository.findByIdAndProductId(reviewId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductReview", "id", reviewId));
    }

    private void ensureCanModify(ProductReview review, UUID userId, boolean admin) {
        if (!admin && !review.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only modify your own review");
        }
    }

    private String normalizeComment(String comment) {
        if (comment == null) {
            return null;
        }
        String trimmed = comment.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private ProductReviewDTO toDTO(ProductReview review) {
        return ProductReviewDTO.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .userId(review.getUserId())
                .userName(review.getUserName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
