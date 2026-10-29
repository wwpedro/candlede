// UpdateContentRequest.java
package com.store.candlede.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateContentRequest(
    @NotBlank(message = "Título é obrigatório")
    @Size(max = 150)
    String title,

    @NotBlank(message = "Conteúdo é obrigatório")
    String content,

    Boolean active
) {}