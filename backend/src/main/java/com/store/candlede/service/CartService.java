package com.store.candlede.service;

import com.store.candlede.dto.AddCartItemRequest;
import com.store.candlede.dto.CartItemResponse;
import com.store.candlede.dto.CartResponse;
import com.store.candlede.dto.UpdateCartItemRequest;
import com.store.candlede.entity.Cart;
import com.store.candlede.entity.CartItem;
import com.store.candlede.entity.Product;
import com.store.candlede.entity.User;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.CartItemRepository;
import com.store.candlede.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final UserService userService;
    private final InventoryService inventoryService;

    @Transactional
    public CartResponse getCart(Long userId) {

        Cart cart = getOrCreateCart(userId);

        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(
            Long userId,
            AddCartItemRequest request
    ) {

        Cart cart = getOrCreateCart(userId);

        Product product = productService.findEntity(
                request.productId()
        );

        validateProduct(product);

        int stock = inventoryService
                .findByProductId(product.getId())
                .quantity();

        CartItem item = cartItemRepository
                .findByCartIdAndProductId(
                        cart.getId(),
                        product.getId()
                )
                .orElse(null);

        int newQuantity = request.quantity();

        if (item != null) {
            newQuantity += item.getQuantity();
        }

        if (stock < newQuantity) {
            throw new BusinessException(
                    "Quantidade solicitada maior que o estoque disponível."
            );
        }

        if (item == null) {

            item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .build();

        } else {

            item.setQuantity(newQuantity);
        }

        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(
            Long userId,
            Long itemId,
            UpdateCartItemRequest request
    ) {

        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository
                .findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Item do carrinho não encontrado."
                        )
                );

        validateProduct(item.getProduct());

        int stock = inventoryService
                .findByProductId(item.getProduct().getId())
                .quantity();

        if (request.quantity() > stock) {
            throw new BusinessException(
                    "Quantidade solicitada maior que o estoque disponível."
            );
        }

        item.setQuantity(request.quantity());

        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Transactional
    public void removeItem(
            Long userId,
            Long itemId
    ) {

        Cart cart = getOrCreateCart(userId);

        CartItem item = cartItemRepository
                .findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Item do carrinho não encontrado."
                        )
                );

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clear(Long userId) {

        Cart cart = getOrCreateCart(userId);

        cartItemRepository.deleteByCartId(cart.getId());
    }

    public Cart getOrCreateCart(Long userId) {

        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {

                    User user = userService.getEntityById(
                            userId
                    );

                    Cart cart = Cart.builder()
                            .user(user)
                            .items(new ArrayList<>())
                            .build();

                    return cartRepository.save(cart);
                });
    }

    private void validateProduct(Product product) {

        if (!product.getActive()) {
            throw new BusinessException(
                    "Este produto não está disponível."
            );
        }
    }

    private CartResponse toResponse(Cart cart) {

        List<CartItemResponse> items = cart.getItems()
                .stream()
                .map(item -> {

                    BigDecimal subtotal =
                            item.getProduct()
                                    .getPrice()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    item.getQuantity()
                                            )
                                    );

                    return new CartItemResponse(
                            item.getId(),
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            item.getProduct().getImageUrl(),
                            item.getQuantity(),
                            item.getProduct().getPrice(),
                            subtotal
                    );
                })
                .toList();

        BigDecimal total = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );

        return new CartResponse(
                cart.getId(),
                items,
                total
        );
    }
}
