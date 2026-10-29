package com.store.candlede.controller;

import com.store.candlede.dto.AddCartItemRequest;
import com.store.candlede.dto.CartResponse;
import com.store.candlede.dto.UpdateCartItemRequest;
import com.store.candlede.entity.User;
import com.store.candlede.service.CartService;
import com.store.candlede.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    @GetMapping
    public CartResponse getCart(
            Authentication authentication
    ) {

        User user = getUser(authentication);

        return cartService.getCart(user.getId());
    }

    @PostMapping("/items")
    public CartResponse addItem(
            Authentication authentication,
            @Valid @RequestBody AddCartItemRequest request
    ) {

        User user = getUser(authentication);

        return cartService.addItem(
                user.getId(),
                request
        );
    }

    @PutMapping("/items/{itemId}")
    public CartResponse updateItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {

        User user = getUser(authentication);

        return cartService.updateItem(
                user.getId(),
                itemId,
                request
        );
    }

    @DeleteMapping("/items/{itemId}")
    public void removeItem(
            Authentication authentication,
            @PathVariable Long itemId
    ) {

        User user = getUser(authentication);

        cartService.removeItem(
                user.getId(),
                itemId
        );
    }

    @DeleteMapping
    public void clear(
            Authentication authentication
    ) {

        User user = getUser(authentication);

        cartService.clear(user.getId());
    }

    private User getUser(
            Authentication authentication
    ) {

        return userService.getEntityByEmail(
                authentication.getName()
        );
    }
}
