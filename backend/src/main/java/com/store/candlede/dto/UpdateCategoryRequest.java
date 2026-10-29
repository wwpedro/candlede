package com.store.candlede.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCategoryRequest(

        @NotBlank(message = "Nome da categoria é obrigatório")
        @Size(max = 100)
        String name,

        String description,

        Boolean active

) {
}