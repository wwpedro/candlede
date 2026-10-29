package com.store.candlede.dto;

public record UserResponse(

        Long id,
        String name,
        String email,
        String phone,
        String role,
        Boolean active

) {
}
