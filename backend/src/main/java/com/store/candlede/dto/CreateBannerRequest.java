package com.store.candlede.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateBannerRequest(
    @NotBlank String title,
    String subtitle,
    @NotBlank String imageUrl,
    String buttonText,
    String buttonLink,
    @NotNull Integer displayOrder
) {}
