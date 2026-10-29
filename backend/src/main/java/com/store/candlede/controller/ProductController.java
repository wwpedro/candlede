package com.store.candlede.controller;

import com.store.candlede.dto.CreateProductRequest;
import com.store.candlede.dto.ProductResponse;
import com.store.candlede.dto.UpdateProductRequest;
import com.store.candlede.entity.Category;
import com.store.candlede.service.CategoryService;
import com.store.candlede.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CategoryService categoryService;   // ← ADICIONA

    /*
     * PÚBLICO
     */
    @GetMapping("/products")
    public List<ProductResponse> findAll() {
        return productService.findAllPublic();
    }

    @GetMapping("/products/{id}")
    public ProductResponse findById(@PathVariable Long id) {
        return productService.findPublicById(id);
    }

    @GetMapping("/products/category/{categoryId}")
    public List<ProductResponse> findByCategory(@PathVariable Long categoryId) {
        return productService.findByCategory(categoryId);
    }

    // ---------- NOVO: busca por slug ----------
    @GetMapping("/products/category/slug/{slug}")
    public List<ProductResponse> findByCategorySlug(@PathVariable String slug) {
        Category category = categoryService.findBySlugEntity(slug);
        return productService.findByCategory(category.getId());
    }

    @GetMapping("/products/search")
    public List<ProductResponse> search(@RequestParam String name) {
        return productService.search(name);
    }

    /*
     * ADMIN
     */
    @GetMapping("/admin/products")
    public List<ProductResponse> findAllForAdmin() {
        return productService.findAllForAdmin();
    }

    @PostMapping("/admin/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
        return productService.create(request);
    }

    @PutMapping("/admin/products/{id}")
    public ProductResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        return productService.update(id, request);
    }

    @PatchMapping("/admin/products/{id}/deactivate")
    public void deactivate(@PathVariable Long id) {
        productService.deactivate(id);
    }
}