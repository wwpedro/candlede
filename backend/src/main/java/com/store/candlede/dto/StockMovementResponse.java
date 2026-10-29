package com.store.candlede.dto;

import com.store.candlede.enums.StockMovementType;

import java.time.LocalDateTime;

public record StockMovementResponse(

        Long id,

        Long productId,

        String productName,

        Long orderId,

        StockMovementType movementType,

        Integer quantity,

        Integer previousQuantity,

        Integer newQuantity,

        String reason,

        LocalDateTime createdAt

) {
}