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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    @Transactional // <-- Mantém a sessão do banco aberta para ler os itens do carrinho
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

            // Chama o serviço que agora captura os erros reais do Melhor Envio
            return melhorEnvioService.calculateShipping(originCep, destinationCep, cart.getItems());

        } catch (BusinessException e) {
            // Repassa a mensagem exata que veio do Melhor Envio (ex: "Token inválido", "CEP não atendido")
            throw e; 
        } catch (Exception e) {
            // Se for um erro totalmente inesperado (ex: NullPointerException), avisa o cliente
            throw new BusinessException("Erro interno ao calcular frete: " + e.getMessage());
        }
    }
}