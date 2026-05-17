package com.ecommerce.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewDTO {
    private UUID id;
    private UUID productId;
    private UUID userId;
    private String userName;
    private int rating;
    private String comment;
    private Instant createdAt;
    private Instant updatedAt;
}
