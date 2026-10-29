package com.store.candlede.controller;

import com.store.candlede.dto.AdjustStockRequest;
import com.store.candlede.dto.InventoryResponse;
import com.store.candlede.dto.OrderResponse;
import com.store.candlede.dto.StockMovementResponse;
import com.store.candlede.dto.UpdateOrderStatusRequest;
import com.store.candlede.enums.OrderStatus;
import com.store.candlede.repository.OrderRepository;
import com.store.candlede.repository.ProductRepository;
import com.store.candlede.service.InventoryService;
import com.store.candlede.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final OrderService orderService;
    private final InventoryService inventoryService;

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    // =========================================================
    // DASHBOARD
    // =========================================================

    @GetMapping("/dashboard")
    @Transactional(readOnly = true)
    public Map<String, Object> dashboard() {

        long totalProducts =
                productRepository.count();

        long totalOrders =
                orderRepository.count();

        BigDecimal totalSales =
                orderRepository
                        .findAll()
                        .stream()
                        .filter(order ->
                                order.getStatus() != OrderStatus.CANCELLED
                        )
                        .map(order -> order.getTotal())
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        long lowStockProducts =
                inventoryService
                        .findLowStock()
                        .size();

        return Map.of(
                "totalProducts", totalProducts,
                "totalOrders", totalOrders,
                "lowStockProducts", lowStockProducts,
                "totalSales", totalSales
        );
    }

    // =========================================================
    // ESTOQUE
    // =========================================================

    @GetMapping("/inventory")
    public List<InventoryResponse> inventory() {

        return inventoryService.findAll();
    }

    @GetMapping("/inventory/low-stock")
    public List<InventoryResponse> lowStock() {

        return inventoryService.findLowStock();
    }

    @GetMapping("/inventory/{productId}")
    public InventoryResponse inventoryByProduct(
            @PathVariable Long productId
    ) {

        return inventoryService.findByProductId(productId);
    }

    @GetMapping("/inventory/{productId}/movements")
    public List<StockMovementResponse> movements(
            @PathVariable Long productId
    ) {

        return inventoryService.findMovements(productId);
    }

    @PostMapping("/inventory/{productId}/entry")
    public InventoryResponse addStock(
            @PathVariable Long productId,
            @Valid @RequestBody AdjustStockRequest request
    ) {

        return inventoryService.addStock(
                productId,
                request.quantity(),
                request.reason()
        );
    }

    @PostMapping("/inventory/{productId}/adjustment")
    public InventoryResponse adjustStock(
            @PathVariable Long productId,
            @Valid @RequestBody AdjustStockRequest request
    ) {

        return inventoryService.adjustStock(
                productId,
                request.quantity(),
                request.reason()
        );
    }

    // =========================================================
    // PEDIDOS
    // =========================================================

    @GetMapping("/orders")
    public List<OrderResponse> orders() {

        return orderService.findAllForAdmin();
    }

    @GetMapping("/orders/{id}")
    public OrderResponse order(
            @PathVariable Long id
    ) {

        return orderService.findByIdForAdmin(id);
    }

    @PatchMapping("/orders/{id}/status")
    public OrderResponse updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {

        return orderService.updateStatus(
                id,
                request.status()
        );
    }
}