package com.store.candlede.controller;

import com.store.candlede.dto.UpdateUserRequest;
import com.store.candlede.dto.UserResponse;
import com.store.candlede.entity.User;
import com.store.candlede.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse me(
            Authentication authentication
    ) {

        User user = userService.getEntityByEmail(
                authentication.getName()
        );

        return userService.getById(user.getId());
    }

    @PutMapping("/me")
    public UserResponse update(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request
    ) {

        User user = userService.getEntityByEmail(
                authentication.getName()
        );

        return userService.update(
                user.getId(),
                request
        );
    }
}
