package com.store.candlede.controller;

import com.store.candlede.entity.Review;
import com.store.candlede.entity.Order;
import com.store.candlede.entity.User;
import com.store.candlede.entity.Product;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.ReviewRepository;
import com.store.candlede.repository.OrderRepository;
import com.store.candlede.repository.ProductRepository;
import com.store.candlede.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserService userService;

    @PostMapping
    @Transactional // <--- ESSA LINHA É A CHAVE PARA O ERRO 500 SUMIR
    public void createReview(
            Authentication authentication,
            @RequestBody Map<String, Object> body
    ) {
        User user = userService.getEntityByEmail(authentication.getName());
        
        // Proteção contra dados nulos
        if (body.get("orderId") == null || body.get("productId") == null || body.get("rating") == null) {
            throw new BusinessException("Dados incompletos para avaliar.");
        }

        Long orderId = Long.valueOf(body.get("orderId").toString());
        Long productId = Long.valueOf(body.get("productId").toString());
        
        // Converte o rating de forma segura
        Number ratingNum = (Number) body.get("rating");
        Integer rating = ratingNum.intValue();
        
        String comment = (String) body.get("comment");

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado."));

        if (order.getDeliveryConfirmedAt() == null) {
            throw new BusinessException("Você precisa confirmar o recebimento antes de avaliar.");
        }

        // Agora o Hibernate consegue carregar a lista de itens sem quebrar
        boolean productInOrder = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getId().equals(productId));
                
        if (!productInOrder) {
            throw new BusinessException("Este produto não faz parte deste pedido.");
        }

        if (reviewRepository.existsByOrderIdAndProductId(orderId, productId)) {
            throw new BusinessException("Você já avaliou este produto.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado."));

        Review review = Review.builder()
                .order(order)
                .product(product)
                .user(user)
                .rating(rating)
                .comment(comment)
                .build();

        reviewRepository.save(review);
    }
}