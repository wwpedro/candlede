// CreateContactMessageRequest.java
package com.store.candlede.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateContactMessageRequest(
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 150)
    String name,

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    @Size(max = 150)
    String email,

    @Size(max = 255)
    String subject,

    @NotBlank(message = "Mensagem é obrigatória")
    @Size(max = 5000)
    String message
) {}