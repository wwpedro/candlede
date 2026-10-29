package com.store.candlede.dto;

import com.store.candlede.enums.StockMovementType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AdjustStockRequest(

        @NotNull(message = "Quantidade é obrigatória")
        @Positive(message = "Quantidade deve ser maior que zero")
        Integer quantity,

        @NotNull(message = "Tipo de movimentação é obrigatório")
        StockMovementType movementType,

        String reason

) {
}