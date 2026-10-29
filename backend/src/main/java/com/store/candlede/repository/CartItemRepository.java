package com.store.candlede.repository;

import com.store.candlede.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(
            Long cartId,
            Long productId
    );

    Optional<CartItem> findByIdAndCartId(
            Long itemId,
            Long cartId
    );

    void deleteByCartId(Long cartId);

}
