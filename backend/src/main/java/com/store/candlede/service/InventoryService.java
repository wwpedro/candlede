package com.store.candlede.service;

import com.store.candlede.dto.InventoryResponse;
import com.store.candlede.dto.StockMovementResponse;
import com.store.candlede.entity.Inventory;
import com.store.candlede.entity.Product;
import com.store.candlede.entity.StockMovement;
import com.store.candlede.enums.StockMovementType;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.InventoryRepository;
import com.store.candlede.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AuditService auditService;

    // =========================================================
    // LEITURA
    // =========================================================
    @Transactional(readOnly = true)
    public List<InventoryResponse> findAll() {
        return inventoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryResponse findByProductId(Long productId) {
        Inventory inventory = getByProductId(productId);
        return toResponse(inventory);
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> findLowStock() {
        return inventoryRepository.findAll()
                .stream()
                .filter(inventory ->
                        inventory.getQuantity() <= inventory.getMinimumQuantity()
                )
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponse> findMovements(Long productId) {
        Inventory inventory = getByProductId(productId);

        return stockMovementRepository
                .findByInventoryIdOrderByCreatedAtDesc(inventory.getId())
                .stream()
                .map(this::toMovementResponse)
                .toList();
    }

    // =========================================================
    // ESCRITA
    // =========================================================
    @Transactional
    public InventoryResponse addStock(Long productId, Integer quantity, String reason) {
        if (quantity <= 0) {
            throw new BusinessException("A quantidade deve ser maior que zero.");
        }

        Inventory inventory = getByProductId(productId);

        int previous = inventory.getQuantity();
        int current = previous + quantity;

        inventory.setQuantity(current);
        inventoryRepository.save(inventory);

        StockMovement movement = StockMovement.builder()
                .inventory(inventory)
                .movementType(StockMovementType.ENTRY)
                .quantity(quantity)
                .previousQuantity(previous)
                .newQuantity(current)
                .reason(reason)
                .build();
        stockMovementRepository.save(movement);

        // ===== AUDITORIA =====
        auditService.log(
                "INVENTORY_ENTRY",
                "Inventory",
                inventory.getId(),
                "Entrada de " + quantity + " un em "
                        + inventory.getProduct().getName()
                        + ". Motivo: " + reason
        );

        return toResponse(inventory);
    }

    @Transactional
    public InventoryResponse adjustStock(Long productId, Integer newQuantity, String reason) {
        if (newQuantity < 0) {
            throw new BusinessException("Estoque não pode ser negativo.");
        }

        Inventory inventory = getByProductId(productId);

        int previous = inventory.getQuantity();

        if (previous == newQuantity) {
            throw new BusinessException(
                    "O novo estoque é igual ao estoque atual."
            );
        }

        int difference = Math.abs(newQuantity - previous);

        inventory.setQuantity(newQuantity);
        inventoryRepository.save(inventory);

        StockMovement movement = StockMovement.builder()
                .inventory(inventory)
                .movementType(StockMovementType.ADJUSTMENT)
                .quantity(difference)
                .previousQuantity(previous)
                .newQuantity(newQuantity)
                .reason(reason)
                .build();
        stockMovementRepository.save(movement);

        // ===== AUDITORIA =====
        auditService.log(
                "INVENTORY_ADJUSTMENT",
                "Inventory",
                inventory.getId(),
                "Ajuste em " + inventory.getProduct().getName()
                        + ": " + previous + " → " + newQuantity
                        + ". Motivo: " + reason
        );

        return toResponse(inventory);
    }

    @Transactional
    public void removeForSale(
            Product product,
            Integer quantity,
            com.store.candlede.entity.Order order
    ) {
        Inventory inventory = getByProductId(product.getId());

        int previous = inventory.getQuantity();

        if (previous < quantity) {
            throw new BusinessException(
                    "Estoque insuficiente para o produto: " + product.getName()
            );
        }

        int current = previous - quantity;

        inventory.setQuantity(current);
        inventoryRepository.save(inventory);

        StockMovement movement = StockMovement.builder()
                .inventory(inventory)
                .order(order)
                .movementType(StockMovementType.SALE)
                .quantity(quantity)
                .previousQuantity(previous)
                .newQuantity(current)
                .reason("Venda do pedido #" + order.getId())
                .build();
        stockMovementRepository.save(movement);

        // Auditoria já é feita pelo OrderService (ORDER_CREATE)
    }

    @Transactional
    public void returnForCancelledOrder(
            Product product,
            Integer quantity,
            com.store.candlede.entity.Order order
    ) {
        Inventory inventory = getByProductId(product.getId());

        int previous = inventory.getQuantity();
        int current = previous + quantity;

        inventory.setQuantity(current);
        inventoryRepository.save(inventory);

        StockMovement movement = StockMovement.builder()
                .inventory(inventory)
                .order(order)
                .movementType(StockMovementType.RETURN)
                .quantity(quantity)
                .previousQuantity(previous)
                .newQuantity(current)
                .reason("Cancelamento do pedido #" + order.getId())
                .build();
        stockMovementRepository.save(movement);

        // Auditoria já é feita pelo OrderService (ORDER_CANCEL)
    }

    // =========================================================
    // HELPERS
    // =========================================================
    @Transactional(readOnly = true)
    public Inventory getByProductId(Long productId) {
        return inventoryRepository
                .findByProductId(productId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Estoque do produto não encontrado."
                        )
                );
    }

    private InventoryResponse toResponse(Inventory inventory) {
        Product product = inventory.getProduct();

        return new InventoryResponse(
                inventory.getId(),
                product.getId(),
                product.getName(),
                inventory.getQuantity(),
                inventory.getMinimumQuantity(),
                inventory.getQuantity() <= inventory.getMinimumQuantity()
        );
    }

    private StockMovementResponse toMovementResponse(StockMovement movement) {
        Product product = movement.getInventory().getProduct();

        return new StockMovementResponse(
                movement.getId(),
                product.getId(),
                product.getName(),
                movement.getOrder() != null ? movement.getOrder().getId() : null,
                movement.getMovementType(),
                movement.getQuantity(),
                movement.getPreviousQuantity(),
                movement.getNewQuantity(),
                movement.getReason(),
                movement.getCreatedAt()
        );
    }
}