// ContactMessageResponse.java
package com.store.candlede.dto;

import java.time.LocalDateTime;

public record ContactMessageResponse(
    Long id,
    String name,
    String email,
    String subject,
    String message,
    Boolean read,
    LocalDateTime createdAt
) {}