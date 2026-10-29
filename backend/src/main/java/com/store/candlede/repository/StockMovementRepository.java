package com.store.candlede.repository;

import com.store.candlede.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository
        extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByInventoryIdOrderByCreatedAtDesc(
            Long inventoryId
    );

    List<StockMovement> findByOrderIdOrderByCreatedAtDesc(
            Long orderId
    );

}
