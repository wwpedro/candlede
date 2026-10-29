package com.store.candlede.controller;

import com.store.candlede.dto.CreateOrderRequest;
import com.store.candlede.dto.OrderResponse;
import com.store.candlede.entity.User;
import com.store.candlede.service.OrderService;
import com.store.candlede.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserService userService;

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

    private User getUser(
            Authentication authentication
    ) {

        return userService.getEntityByEmail(
                authentication.getName()
        );
    }
}