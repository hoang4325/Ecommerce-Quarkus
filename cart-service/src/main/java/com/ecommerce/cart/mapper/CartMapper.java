package com.ecommerce.cart.mapper;

import com.ecommerce.cart.dto.CartDTO;
import com.ecommerce.cart.dto.CartItemDTO;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "cdi", imports = {BigDecimal.class})
public interface CartMapper {

    @Mapping(target = "subtotal", expression = "java(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))")
    CartItemDTO toItemDTO(CartItem item);

    List<CartItemDTO> toItemDTOs(List<CartItem> items);

    @Mapping(target = "totalAmount", expression = "java(calculateTotal(cart))")
    @Mapping(target = "itemCount", expression = "java(cart.getItems().size())")
    CartDTO toDTO(Cart cart);

    default BigDecimal calculateTotal(Cart cart) {
        return cart.getItems().stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
