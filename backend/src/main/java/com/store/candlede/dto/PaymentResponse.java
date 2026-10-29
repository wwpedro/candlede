package com.store.candlede.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long orderId,
        String transactionId,
        String paymentMethod,
        BigDecimal amount,
        String status,
        String statusDetail,
        String paymentTypeId,
        String qrCode,          // base64 da imagem do QR
        String qrCodeText,      // "copia e cola"
        String ticketUrl,       // URL do MP (opcional)
        LocalDateTime createdAt
) {}