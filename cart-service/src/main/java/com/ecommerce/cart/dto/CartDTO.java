package com.ecommerce.cart.dto;

import com.ecommerce.cart.entity.CartStatus;
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
public class CartDTO {
    private UUID id;
    private UUID userId;
    private CartStatus status;
    private List<CartItemDTO> items;
    private BigDecimal totalAmount;
    private int itemCount;
    private Instant createdAt;
    private Instant updatedAt;
}
