package com.store.candlede.dto;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        Long userId,
        String userEmail,
        String userRole,
        String action,
        String entity,
        Long entityId,
        String details,
        String ip,
        String userAgent,
        LocalDateTime createdAt
) {}