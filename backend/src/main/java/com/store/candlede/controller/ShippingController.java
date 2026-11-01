package com.store.candlede.controller;

import com.store.candlede.dto.ShippingOption;
import com.store.candlede.entity.Cart;
import com.store.candlede.entity.User;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.service.CartService;
import com.store.candlede.service.MelhorEnvioService;
import com.store.candlede.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional; // <-- IMPORTANTE
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final MelhorEnvioService melhorEnvioService;
    private final CartService cartService;
    private final UserService userService;

    @Value("${app.shipping.origin-cep:57000000}")
    private String originCep;

    @PostMapping("/calculate")
    @Transactional // <-- ESSA LINHA RESOLVE O ERRO "NO SESSION"
    public List<ShippingOption> calculate(
            Authentication authentication,
            @RequestBody Map<String, String> body
    ) {
        try {
            String destinationCep = body.get("cep");
            if (destinationCep == null || destinationCep.trim().length() < 8) {
                throw new BusinessException("CEP inválido.");
            }

            User user = userService.getEntityByEmail(authentication.getName());
            Cart cart = cartService.getOrCreateCart(user.getId());

            if (cart.getItems().isEmpty()) {
                throw new BusinessException("O carrinho está vazio.");
            }

            return melhorEnvioService.calculateShipping(originCep, destinationCep, cart.getItems());
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Erro ao calcular frete: " + e.getMessage());
        }
    }
}