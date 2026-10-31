package com.store.candlede.repository;

import com.store.candlede.entity.Order;
import com.store.candlede.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository
        extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByIdAndUserId(
            Long orderId,
            Long userId
    );

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByStatusOrderByCreatedAtDesc(
            OrderStatus status
    );

    long countByStatus(OrderStatus status);
    
 // Em OrderRepository, adicione:
    boolean existsByIdAndUserId(Long orderId, Long userId);
    
    long countByUserIdAndStatus(Long userId, OrderStatus status);

}