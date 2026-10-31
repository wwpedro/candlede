package com.store.candlede.repository;

import com.store.candlede.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByOrderId(Long orderId);

	boolean existsByOrderIdAndProductId(Long orderId, Long productId);
}