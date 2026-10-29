package com.store.candlede.dto;
public record BannerResponse(
    Long id,
    String title,
    String subtitle,
    String imageUrl,
    String buttonText,
    String buttonLink,
    Integer displayOrder,
    Boolean active
) {}
