package com.store.candlede.dto;

import com.store.candlede.enums.OrderStatus;
import com.store.candlede.enums.PaymentMethod;
import com.store.candlede.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(

        Long id,

        Long userId,

        String customerName,
        String customerEmail,
        String customerPhone,

        BigDecimal subtotal,
        BigDecimal shippingPrice,
        BigDecimal total,

        OrderStatus status,
        PaymentStatus paymentStatus,
        PaymentMethod paymentMethod,

        String cep,
        String street,
        String number,
        String complement,
        String neighborhood,
        String city,
        String state,

        List<OrderItemResponse> items,

        LocalDateTime createdAt,
        
        Boolean reviewed

) {
}
