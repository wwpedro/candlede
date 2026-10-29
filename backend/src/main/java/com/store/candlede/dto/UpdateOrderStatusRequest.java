package com.store.candlede.dto;

import com.store.candlede.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(

        @NotNull(message = "Status é obrigatório")
        OrderStatus status

) {
}
