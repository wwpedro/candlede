package com.store.candlede.dto;

public record InventoryResponse(

        Long id,
        Long productId,
        String productName,
        Integer quantity,
        Integer minimumQuantity,
        Boolean lowStock

) {
}