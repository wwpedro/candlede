package com.store.candlede.service;

import com.store.candlede.dto.CategoryResponse;
import com.store.candlede.dto.CreateCategoryRequest;
import com.store.candlede.dto.UpdateCategoryRequest;
import com.store.candlede.entity.Category;
import com.store.candlede.entity.Product;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.CategoryRepository;
import com.store.candlede.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AuditService auditService;

    // =========================================================
    // LEITURA
    // =========================================================
    public List<CategoryResponse> findAllActive() {
        return categoryRepository
                .findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<CategoryResponse> findAllForAdmin() {
        return categoryRepository
                .findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Categoria não encontrada.")
                );
        return toResponse(category);
    }

    // =========================================================
    // CRIAR
    // =========================================================
    @Transactional
    public CategoryResponse create(CreateCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name())) {
            throw new BusinessException("Já existe uma categoria com este nome.");
        }

        String slug = generateUniqueSlug(request.name());

        Category category = Category.builder()
                .name(request.name().trim())
                .slug(slug)
                .description(request.description())
                .active(true)
                .build();
        categoryRepository.save(category);

        auditService.log(
                "CATEGORY_CREATE",
                "Category",
                category.getId(),
                "Criou: " + category.getName() + " (slug: " + slug + ")"
        );

        return toResponse(category);
    }

    // =========================================================
    // ATUALIZAR
    // =========================================================
    @Transactional
    public CategoryResponse update(Long id, UpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        categoryRepository.findByNameIgnoreCase(request.name())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BusinessException("Já existe uma categoria com este nome.");
                    }
                });

        String oldName = category.getName();

        category.setName(request.name().trim());
        category.setDescription(request.description());
        if (request.active() != null) {
            category.setActive(request.active());
        }

        if (category.getSlug() == null || !category.getName().equals(request.name())) {
            category.setSlug(generateUniqueSlug(request.name()));
        }

        categoryRepository.save(category);

        auditService.log(
                "CATEGORY_UPDATE",
                "Category",
                category.getId(),
                "Atualizou: " + oldName + " → " + category.getName()
        );

        return toResponse(category);
    }

    // =========================================================
    // DESATIVAR (categoria + produtos)
    // =========================================================
    @Transactional
    public void deactivate(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        category.setActive(false);
        categoryRepository.save(category);

        // =========================================================
        // Desativa TODOS os produtos dessa categoria
        // =========================================================
        List<Product> produtos = productRepository.findByCategoryIdAndActiveTrue(id);

        for (Product p : produtos) {
            p.setActive(false);
        }
        productRepository.saveAll(produtos);

        auditService.log(
                "CATEGORY_DEACTIVATE",
                "Category",
                category.getId(),
                "Desativou categoria e " + produtos.size() + " produto(s): " + category.getName()
        );
    }

    // =========================================================
    // HELPERS
    // =========================================================
    private String generateUniqueSlug(String name) {
        String base = slugify(name);
        String slug = base;
        int i = 1;
        while (categoryRepository.findBySlug(slug).isPresent()) {
            slug = base + "-" + i++;
        }
        return slug;
    }

    private String slugify(String text) {
        return text.toLowerCase()
                .replaceAll("[áàâãä]", "a")
                .replaceAll("[éèêë]", "e")
                .replaceAll("[íìîï]", "i")
                .replaceAll("[óòôõö]", "o")
                .replaceAll("[úùûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    public Category findBySlugEntity(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getActive()
        );
    }
}