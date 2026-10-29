// ContentResponse.java
package com.store.candlede.dto;

public record ContentResponse(
    Long id,
    String key,
    String title,
    String content,
    Boolean active
) {}