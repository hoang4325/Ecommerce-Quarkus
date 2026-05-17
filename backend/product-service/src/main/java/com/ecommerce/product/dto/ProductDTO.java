package com.ecommerce.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private String color;
    private String productSize;
    private String dressStyle;
    private List<String> images;
    private UUID categoryId;
    private String categoryName;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
