package com.store.candlede.controller;

import com.store.candlede.dto.CategoryResponse;
import com.store.candlede.dto.CreateCategoryRequest;
import com.store.candlede.dto.UpdateCategoryRequest;
import com.store.candlede.entity.Category;
import com.store.candlede.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/categories")
    public List<CategoryResponse> findAll() {
        return categoryService.findAllActive();
    }

    @GetMapping("/categories/{id}")
    public CategoryResponse findById(
            @PathVariable Long id
    ) {
        return categoryService.findById(id);
    }

    @PostMapping("/admin/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        return categoryService.create(request);
    }

    @PutMapping("/admin/categories/{id}")
    public CategoryResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request
    ) {
        return categoryService.update(id, request);
    }

    @PatchMapping("/admin/categories/{id}/deactivate")
    public void deactivate(
            @PathVariable Long id
    ) {
        categoryService.deactivate(id);
    }
    
    @GetMapping("/categories/slug/{slug}")
    public CategoryResponse findBySlug(@PathVariable String slug) {
        Category c = categoryService.findBySlugEntity(slug);
        return categoryService.findById(c.getId());
    }
    
    @GetMapping("/admin/categories")
    public List<CategoryResponse> findAllForAdmin() {
        return categoryService.findAllForAdmin();
    }
}
