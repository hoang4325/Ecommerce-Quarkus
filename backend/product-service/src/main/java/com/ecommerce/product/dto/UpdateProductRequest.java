package com.ecommerce.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class UpdateProductRequest {

    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;

    @Size(max = 280, message = "Slug must not exceed 280 characters")
    private String slug;

    private String description;

    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price format is invalid")
    private BigDecimal price;

    private String imageUrl;

    @Size(max = 64, message = "Color must not exceed 64 characters")
    private String color;

    @Size(max = 64, message = "Product size must not exceed 64 characters")
    private String productSize;

    @Size(max = 64, message = "Dress style must not exceed 64 characters")
    private String dressStyle;

    private UUID categoryId;

    private Boolean active;
}
