package com.ecommerce.product.mapper;

import com.ecommerce.product.dto.CategoryDTO;
import com.ecommerce.product.entity.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "cdi")
public interface CategoryMapper {
    CategoryDTO toDTO(Category category);
}
