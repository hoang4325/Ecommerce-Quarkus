package com.ecommerce.product.service;

import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.dto.CategoryDTO;
import com.ecommerce.product.dto.CreateCategoryRequest;
import com.ecommerce.product.entity.Category;
import com.ecommerce.product.mapper.CategoryMapper;
import com.ecommerce.product.repository.CategoryRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class CategoryService {

    private static final Logger LOG = Logger.getLogger(CategoryService.class);

    @Inject CategoryRepository categoryRepository;
    @Inject CategoryMapper categoryMapper;

    public List<CategoryDTO> findAll() {
        return categoryRepository.listAll()
                .stream()
                .map(categoryMapper::toDTO)
                .toList();
    }

    public CategoryDTO findById(UUID id) {
        Category category = categoryRepository.findByIdOptional(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return categoryMapper.toDTO(category);
    }

    @Transactional
    public CategoryDTO create(CreateCategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw new BusinessException("Category with slug '" + request.getSlug() + "' already exists");
        }
        Category category = new Category(request.getName(), request.getSlug());
        categoryRepository.persist(category);
        LOG.infof("Created category: %s (slug=%s)", category.getName(), category.getSlug());
        return categoryMapper.toDTO(category);
    }
}
