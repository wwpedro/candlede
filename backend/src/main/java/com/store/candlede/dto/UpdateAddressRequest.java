package com.store.candlede.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateAddressRequest(

        @NotBlank(message = "CEP é obrigatório")
        @Size(max = 10)
        String cep,

        @NotBlank(message = "Rua é obrigatória")
        @Size(max = 150)
        String street,

        @NotBlank(message = "Número é obrigatório")
        @Size(max = 20)
        String number,

        @Size(max = 100)
        String complement,

        @NotBlank(message = "Bairro é obrigatório")
        @Size(max = 100)
        String neighborhood,

        @NotBlank(message = "Cidade é obrigatória")
        @Size(max = 100)
        String city,

        @NotBlank(message = "Estado é obrigatório")
        @Size(min = 2, max = 2)
        String state

) {
}