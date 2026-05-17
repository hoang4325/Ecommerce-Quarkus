package com.ecommerce.product.mapper;

import com.ecommerce.product.dto.ProductDTO;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.entity.ProductImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "cdi")
public interface ProductMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(target = "images", expression = "java(mapImages(product.getImages()))")
    ProductDTO toDTO(Product product);

    default List<String> mapImages(List<ProductImage> images) {
        if (images == null) return null;
        return images.stream().map(ProductImage::getUrl).collect(Collectors.toList());
    }
}
