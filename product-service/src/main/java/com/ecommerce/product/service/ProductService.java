package com.ecommerce.product.service;

import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.dto.CreateProductRequest;
import com.ecommerce.product.dto.ProductDTO;
import com.ecommerce.product.dto.UpdateProductRequest;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.entity.Product;
import com.ecommerce.product.mapper.ProductMapper;
import com.ecommerce.product.repository.CategoryRepository;
import com.ecommerce.product.repository.ProductRepository;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.util.UUID;

@ApplicationScoped
public class ProductService {

    private static final Logger LOG = Logger.getLogger(ProductService.class);

    @Inject ProductRepository productRepository;
    @Inject CategoryRepository categoryRepository;
    @Inject ProductMapper productMapper;

    public PagedResponse<ProductDTO> findAll(int page, int size, String search) {
        Page pageRequest = Page.of(page, size);
        var query = productRepository.findAllActive(pageRequest, search);
        long total = query.count();
        var products = query.list().stream().map(productMapper::toDTO).toList();
        return PagedResponse.of(products, page, size, total);
    }

    public ProductDTO findById(UUID id) {
        Product product = productRepository.findByIdOptional(id)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toDTO(product);
    }

    @Transactional
    public ProductDTO create(CreateProductRequest request) {
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new BusinessException("Product with slug '" + request.getSlug() + "' already exists");
        }

        Product product = new Product();
        product.setName(request.getName());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setActive(true);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdOptional(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        productRepository.persist(product);
        LOG.infof("Created product: %s (id=%s)", product.getName(), product.getId());
        return productMapper.toDTO(product);
    }

    @Transactional
    public ProductDTO update(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getSlug() != null && !request.getSlug().equals(product.getSlug())) {
            if (productRepository.existsBySlugAndIdNot(request.getSlug(), id)) {
                throw new BusinessException("Product with slug '" + request.getSlug() + "' already exists");
            }
            product.setSlug(request.getSlug());
        }

        if (request.getName() != null)        product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null)       product.setPrice(request.getPrice());
        if (request.getImageUrl() != null)    product.setImageUrl(request.getImageUrl());
        if (request.getActive() != null)      product.setActive(request.getActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdOptional(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        LOG.infof("Updated product: %s (id=%s)", product.getName(), product.getId());
        return productMapper.toDTO(product);
    }

    @Transactional
    public void delete(UUID id) {
        Product product = productRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setActive(false); // Soft delete
        LOG.infof("Soft-deleted product: %s (id=%s)", product.getName(), product.getId());
    }
}
