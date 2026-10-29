package com.store.candlede.service;

import com.store.candlede.dto.CreateOrderRequest;
import com.store.candlede.dto.OrderItemResponse;
import com.store.candlede.dto.OrderResponse;
import com.store.candlede.entity.Cart;
import com.store.candlede.entity.CartItem;
import com.store.candlede.entity.Order;
import com.store.candlede.entity.OrderItem;
import com.store.candlede.entity.Product;
import com.store.candlede.entity.User;
import com.store.candlede.enums.OrderStatus;
import com.store.candlede.enums.PaymentStatus;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.CartRepository;
import com.store.candlede.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserService userService;
    private final CartService cartService;
    private final InventoryService inventoryService;
    private final AuditService auditService;
    
    // Injeção do serviço de frete
    private final ShippingService shippingService;

    // =========================================================
    // CRIAR PEDIDO
    // =========================================================
    @Transactional
    public OrderResponse create(Long userId, CreateOrderRequest request) {

        User user = userService.getEntityById(userId);
        Cart cart = cartService.getOrCreateCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new BusinessException(
                    "Não é possível realizar um pedido com o carrinho vazio."
            );
        }

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            if (!product.getActive()) {
                throw new BusinessException(
                        "O produto " + product.getName() + " não está mais disponível."
                );
            }

            int stock = inventoryService
                    .findByProductId(product.getId())
                    .quantity();

            if (stock < cartItem.getQuantity()) {
                throw new BusinessException(
                        "Estoque insuficiente para o produto: " + product.getName()
                );
            }
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem item : cart.getItems()) {
            BigDecimal itemSubtotal = item.getProduct().getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);
        }

        // Frete é calculado pelo ShippingService com base no CEP
        BigDecimal shippingPrice = shippingService.calcularFrete(request.cep(), subtotal);
        BigDecimal total = subtotal.add(shippingPrice);

        Order order = Order.builder()
                .user(user)
                .customerName(user.getName())
                .customerEmail(user.getEmail())
                .customerPhone(user.getPhone())
                .subtotal(subtotal)
                .shippingPrice(shippingPrice)
                .total(total)
                .status(OrderStatus.RECEIVED)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(request.paymentMethod())
                .cep(request.cep())
                .street(request.street())
                .number(request.number())
                .complement(request.complement())
                .neighborhood(request.neighborhood())
                .city(request.city())
                .state(request.state().toUpperCase())
                .items(new ArrayList<>())
                .build();

        order = orderRepository.save(order);

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            BigDecimal unitPrice = product.getPrice();
            BigDecimal itemSubtotal = unitPrice.multiply(
                    BigDecimal.valueOf(cartItem.getQuantity())
            );

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(unitPrice)
                    .subtotal(itemSubtotal)
                    .build();

            order.getItems().add(orderItem);

            inventoryService.removeForSale(
                    product,
                    cartItem.getQuantity(),
                    order
            );
        }

        orderRepository.save(order);

        // Limpa o carrinho
        cart.getItems().clear();
        cartRepository.save(cart);
        cartRepository.flush(); // <--- GARANTE A LIMPEZA IMEDIATA NO BANCO DE DADOS

        // =========================================================
        // AUDITORIA
        // =========================================================
        auditService.log(
                "ORDER_CREATE",
                "Order",
                order.getId(),
                "Novo pedido #" + order.getId()
                        + " - Total: R$ " + order.getTotal()
                        + " - " + order.getItems().size() + " item(s)"
        );

        return toResponse(order);
    }
    
    @Transactional(readOnly = true)
    public Order findEntity(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Pedido não encontrado.")
                );
    }

    // =========================================================
    // LEITURA
    // =========================================================
    @Transactional(readOnly = true)
    public List<OrderResponse> findByUser(Long userId) {
        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse findByUser(Long orderId, Long userId) {
        Order order = orderRepository
                .findByIdAndUserId(orderId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Pedido não encontrado.")
                );
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> findAllForAdmin() {
        return orderRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse findByIdForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Pedido não encontrado.")
                );
        return toResponse(order);
    }

    // =========================================================
    // ATUALIZAR STATUS
    // =========================================================
    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Pedido não encontrado.")
                );

        OrderStatus currentStatus = order.getStatus();

        validateStatusTransition(currentStatus, newStatus);

        if (newStatus == OrderStatus.CANCELLED
                && currentStatus != OrderStatus.CANCELLED) {

            for (OrderItem item : order.getItems()) {
                inventoryService.returnForCancelledOrder(
                        item.getProduct(),
                        item.getQuantity(),
                        order
                );
            }
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        // =========================================================
        // AUDITORIA
        // =========================================================
        String action = newStatus == OrderStatus.CANCELLED
                ? "ORDER_CANCEL"
                : "ORDER_STATUS_CHANGE";

        auditService.log(
                action,
                "Order",
                order.getId(),
                "Pedido #" + order.getId() + ": " + currentStatus + " → " + newStatus
        );

        return toResponse(order);
    }

    // =========================================================
    // VALIDAÇÕES
    // =========================================================
    private void validateStatusTransition(OrderStatus current, OrderStatus next) {

        if (current == OrderStatus.CANCELLED) {
            throw new BusinessException(
                    "Um pedido cancelado não pode voltar ao fluxo normal."
            );
        }

        if (current == OrderStatus.DELIVERED) {
            throw new BusinessException(
                    "Um pedido entregue não pode ter o status alterado."
            );
        }

        if (current == OrderStatus.RECEIVED
                && next != OrderStatus.PREPARING
                && next != OrderStatus.CANCELLED) {
            throw new BusinessException("Transição de status inválida.");
        }

        if (current == OrderStatus.PREPARING
                && next != OrderStatus.SHIPPED
                && next != OrderStatus.CANCELLED) {
            throw new BusinessException("Transição de status inválida.");
        }

        if (current == OrderStatus.SHIPPED
                && next != OrderStatus.DELIVERED) {
            throw new BusinessException("Transição de status inválida.");
        }
    }

    // =========================================================
    // TO RESPONSE
    // =========================================================
    private OrderResponse toResponse(Order order) {

        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(item ->
                        new OrderItemResponse(
                                item.getId(),
                                item.getProduct().getId(),
                                item.getProductName(),
                                item.getProduct().getImageUrl(),
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getSubtotal()
                        )
                )
                .toList();

        return new OrderResponse(
                order.getId(),
                order.getUser().getId(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getCustomerPhone(),
                order.getSubtotal(),
                order.getShippingPrice(),
                order.getTotal(),
                order.getStatus(),
                order.getPaymentStatus(),
                order.getPaymentMethod(),
                order.getCep(),
                order.getStreet(),
                order.getNumber(),
                order.getComplement(),
                order.getNeighborhood(),
                order.getCity(),
                order.getState(),
                items,
                order.getCreatedAt()
        );
    }
}