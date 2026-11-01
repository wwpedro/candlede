package com.store.candlede.dto;

import java.math.BigDecimal;

import com.store.candlede.enums.PaymentMethod;
import jakarta.validation.constraints.*;

public record CreateOrderRequest(

        @NotBlank(message = "CEP é obrigatório")
        String cep,

        @NotBlank(message = "Rua é obrigatória")
        String street,

        @NotBlank(message = "Número é obrigatório")
        String number,

        String complement,
        
        @NotNull(message = "Frete é obrigatório")
        BigDecimal shippingPrice,

        @NotBlank(message = "Bairro é obrigatório")
        String neighborhood,

        @NotBlank(message = "Cidade é obrigatória")
        String city,

        @NotBlank(message = "Estado é obrigatório")
        @Size(min = 2, max = 2)
        String state,

        @NotNull(message = "Forma de pagamento é obrigatória")
        PaymentMethod paymentMethod

) {
}
