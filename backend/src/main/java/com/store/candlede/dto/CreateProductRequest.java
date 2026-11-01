package com.store.candlede.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateProductRequest(

        @NotBlank(message = "Nome do produto é obrigatório")
        @Size(max = 150)
        String name,

        String description,
        
        @Size(max = 100)
        String line,

        @NotNull(message = "Preço é obrigatório")
        @PositiveOrZero(message = "Preço não pode ser negativo")
        BigDecimal price,

        String imageUrl,

        @NotNull(message = "Categoria é obrigatória")
        Long categoryId,
        
        Double weight,
        Double height,
        Double width,
        Double length,

        @NotNull(message = "Estoque inicial é obrigatório")
        @PositiveOrZero(message = "Estoque não pode ser negativo")
        Integer initialStock,

        @NotNull(message = "Estoque mínimo é obrigatório")
        @PositiveOrZero(message = "Estoque mínimo não pode ser negativo")
        Integer minimumStock
        
        

) {
}
