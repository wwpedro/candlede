package com.store.candlede.dto;

import java.math.BigDecimal;

public record ProductResponse(

        Long id,
        String name,
        String description,
        String line,
        BigDecimal price,
        String imageUrl,
        Boolean active,

        Long categoryId,
        String categoryName,

        Integer stockQuantity,
        Integer minimumStock,

        Boolean lowStock

) {
}