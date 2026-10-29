// CustomerResponse.java
package com.store.candlede.dto;

import java.time.LocalDateTime;

public record CustomerResponse(
    Long id,
    String name,
    String email,
    String phone,
    Boolean active,
    LocalDateTime createdAt
) {}