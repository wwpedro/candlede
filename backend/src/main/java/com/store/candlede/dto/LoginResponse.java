package com.store.candlede.dto;

public record LoginResponse(

        String token,
        Long userId,
        String name,
        String email,
        String role

) {
}