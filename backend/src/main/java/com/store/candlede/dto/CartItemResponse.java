package com.store.candlede.dto;

import java.math.BigDecimal;

public record CartItemResponse(

        Long id,

        Long productId,

        String productName,

        String imageUrl,

        Integer quantity,

        BigDecimal unitPrice,

        BigDecimal subtotal

) {
}