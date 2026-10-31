package com.store.candlede.controller;

import com.store.candlede.dto.CreateOrderRequest;
import com.store.candlede.dto.OrderResponse;
import com.store.candlede.entity.User;
import com.store.candlede.enums.OrderStatus;
import com.store.candlede.repository.OrderRepository;
import com.store.candlede.service.OrderService;
import com.store.candlede.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;
    
    // ADICIONADO: Injeção do repositório para fazer a contagem das notificações
    private final OrderRepository orderRepository;

    @PostMapping
    public OrderResponse create(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        User user = getUser(authentication);
        return orderService.create(
                user.getId(),
                request
        );
    }

    @GetMapping
    public List<OrderResponse> findMyOrders(
            Authentication authentication
    ) {
        User user = getUser(authentication);
        return orderService.findByUser(
                user.getId()
        );
    }

    @GetMapping("/{id}")
    public OrderResponse findMyOrder(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = getUser(authentication);
        return orderService.findByUser(
                id,
                user.getId()
        );
    }
    
    @PatchMapping("/{id}/confirm-delivery")
    public OrderResponse confirmDelivery(
            Authentication authentication,
            @PathVariable Long id
    ) {
        User user = getUser(authentication);
        return orderService.confirmDelivery(id, user.getId());
    }

    // =========================================================
    // NOVO: CONTAGEM DE NOTIFICAÇÕES (Sino do Navbar)
    // =========================================================
    @GetMapping("/pending-confirmation")
    public Map<String, Long> getPendingConfirmations(Authentication authentication) {
        User user = getUser(authentication);
        long count = orderRepository.countByUserIdAndStatus(user.getId(), OrderStatus.DELIVERED);
        return Map.of("count", count);
    }

    // =========================================================
    // HELPER (Mantido exatamente como estava)
    // =========================================================
    private User getUser(
            Authentication authentication
    ) {
        return userService.getEntityByEmail(
                authentication.getName()
        );
    }
}