package com.store.candlede.service;

import com.store.candlede.dto.CreateProductRequest;
import com.store.candlede.dto.ProductResponse;
import com.store.candlede.dto.UpdateProductRequest;
import com.store.candlede.entity.Category;
import com.store.candlede.entity.Inventory;
import com.store.candlede.entity.Product;
import com.store.candlede.entity.StockMovement;
import com.store.candlede.enums.StockMovementType;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.CategoryRepository;
import com.store.candlede.repository.InventoryRepository;
import com.store.candlede.repository.ProductRepository;
import com.store.candlede.repository.StockMovementRepository;
import com.store.candlede.security.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AuditService auditService;      // <-- NOVO
    private final InputSanitizer sanitizer;       // <-- NOVO

    // =========================================================
    // LEITURA
    // =========================================================

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllPublic() {
        return productRepository
                .findByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findPublicById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Produto não encontrado.")
                );

        if (!product.getActive()) {
            throw new ResourceNotFoundException("Produto não encontrado.");
        }

        return toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findByCategory(Long categoryId) {
        return productRepository
                .findByCategoryIdAndActiveTrue(categoryId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> search(String name) {
        return productRepository
                .findByNameContainingIgnoreCaseAndActiveTrue(name)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAllForAdmin() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // ESCRITA
    // =========================================================

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Categoria não encontrada.")
                );

        if (!category.getActive()) {
            throw new BusinessException(
                    "Não é possível cadastrar produto em uma categoria inativa."
            );
        }

        // ===== SANITIZA OS INPUTS =====
        String safeName = sanitizer.sanitizeText(request.name());
        String safeLine = request.line() != null
                ? sanitizer.sanitizeText(request.line())
                : null;

        Product product = Product.builder()
                .name(safeName)
                .description(request.description())      // descrição longa, mantém cru
                .line(safeLine)
                .price(request.price())
                .imageUrl(request.imageUrl())
                .active(true)
                .category(category)
                .build();

        product = productRepository.save(product);

        Inventory inventory = Inventory.builder()
                .product(product)
                .quantity(request.initialStock())
                .minimumQuantity(request.minimumStock())
                .build();

        inventory = inventoryRepository.save(inventory);

        if (request.initialStock() > 0) {
            StockMovement movement = StockMovement.builder()
                    .inventory(inventory)
                    .movementType(StockMovementType.ENTRY)
                    .quantity(request.initialStock())
                    .previousQuantity(0)
                    .newQuantity(request.initialStock())
                    .reason("Estoque inicial")
                    .build();

            stockMovementRepository.save(movement);
        }

        // ===== AUDITORIA =====
        auditService.log(
                "PRODUCT_CREATE",
                "Product",
                product.getId(),
                "Criou: " + product.getName() + " (R$ " + product.getPrice() + ")"
        );

        return toResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        Product product = findEntity(id);

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Categoria não encontrada.")
                );

        if (!category.getActive()) {
            throw new BusinessException("A categoria selecionada está inativa.");
        }

        // ===== SANITIZA OS INPUTS =====
        String safeName = sanitizer.sanitizeText(request.name());
        String safeLine = request.line() != null
                ? sanitizer.sanitizeText(request.line())
                : null;

        // Guarda o valor antigo pra detalhar no log
        String oldName = product.getName();
        boolean wasActive = product.getActive();

        product.setName(safeName);
        product.setDescription(request.description());
        product.setLine(safeLine);
        product.setPrice(request.price());
        product.setImageUrl(request.imageUrl());
        product.setCategory(category);

        if (request.active() != null) {
            product.setActive(request.active());
        }

        productRepository.save(product);

        // ===== AUDITORIA =====
        StringBuilder details = new StringBuilder("Atualizou: " + oldName);
        if (!oldName.equals(safeName)) {
            details.append(" → ").append(safeName);
        }
        if (request.active() != null && wasActive != product.getActive()) {
            details.append(" (").append(product.getActive() ? "ativado" : "desativado").append(")");
        }

        auditService.log(
                "PRODUCT_UPDATE",
                "Product",
                product.getId(),
                details.toString()
        );

        return toResponse(product);
    }

    @Transactional
    public void deactivate(Long id) {
        Product product = findEntity(id);
        product.setActive(false);
        productRepository.save(product);

        // ===== AUDITORIA =====
        auditService.log(
                "PRODUCT_DEACTIVATE",
                "Product",
                product.getId(),
                "Desativou: " + product.getName()
        );
    }

    // =========================================================
    // HELPERS
    // =========================================================

    @Transactional(readOnly = true)
    public Product findEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Produto não encontrado.")
                );
    }

    private ProductResponse toResponse(Product product) {
        Inventory inventory = product.getInventory();

        Integer quantity = 0;
        Integer minimum = 0;

        if (inventory != null) {
            quantity = inventory.getQuantity();
            minimum = inventory.getMinimumQuantity();
        }

        boolean lowStock = quantity <= minimum;

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getLine(),
                product.getPrice(),
                product.getImageUrl(),
                product.getActive(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                quantity,
                minimum,
                lowStock
        );
    }
}