package com.store.candlede.controller;

import com.store.candlede.dto.AddressResponse;
import com.store.candlede.dto.CreateAddressRequest;
import com.store.candlede.dto.UpdateAddressRequest;
import com.store.candlede.entity.User;
import com.store.candlede.service.AddressService;
import com.store.candlede.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final UserService userService;

    @GetMapping
    public List<AddressResponse> findAll(
            Authentication authentication
    ) {

        User user = getUser(authentication);

        return addressService.findByUser(
                user.getId()
        );
    }

    @PostMapping
    public AddressResponse create(
            Authentication authentication,
            @Valid @RequestBody CreateAddressRequest request
    ) {

        User user = getUser(authentication);

        return addressService.create(
                user.getId(),
                request
        );
    }

    @PutMapping("/{id}")
    public AddressResponse update(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateAddressRequest request
    ) {

        User user = getUser(authentication);

        return addressService.update(
                user.getId(),
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    public void delete(
            Authentication authentication,
            @PathVariable Long id
    ) {

        User user = getUser(authentication);

        addressService.delete(
                user.getId(),
                id
        );
    }

    private User getUser(
            Authentication authentication
    ) {

        return userService.getEntityByEmail(
                authentication.getName()
        );
    }
}