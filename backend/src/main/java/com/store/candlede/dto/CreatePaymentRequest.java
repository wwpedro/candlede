package com.store.candlede.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreatePaymentRequest(
        @NotNull(message = "ID do pedido é obrigatório")
        Long orderId,

        @NotBlank(message = "Método de pagamento é obrigatório")
        String paymentMethod,

        // PIX: null. Cartão: token do Brick.
        String paymentToken,

        // Só pra cartão
        String paymentMethodId,
        String paymentType,
        Integer installments,
        String payerEmail
) {}