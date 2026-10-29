package com.store.candlede.service;

import com.mercadopago.resources.payment.Payment;
import com.store.candlede.dto.CreatePaymentRequest;
import com.store.candlede.dto.PaymentResponse;
import com.store.candlede.entity.Order;
import com.store.candlede.enums.OrderStatus;
import com.store.candlede.enums.PaymentMethod;
import com.store.candlede.enums.PaymentStatus;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final AuditService auditService;
    private final MercadoPagoService mercadoPagoService;

    // =========================================================
    // PROCESSAR PAGAMENTO
    // =========================================================
    @Transactional
    public PaymentResponse processPayment(CreatePaymentRequest request) {

        Order order = orderService.findEntity(request.orderId());

        if (order.getPaymentStatus() == PaymentStatus.APPROVED) {
            throw new BusinessException("Este pedido já foi pago.");
        }

        PaymentMethod method = mapPaymentMethod(request.paymentMethod());

        if (method == PaymentMethod.PIX) {
            return processPix(order);
        }

        return processCard(order, method, request);
    }

    // =========================================================
    // PIX — REAL
    // =========================================================
    private PaymentResponse processPix(Order order) {
        Payment mpPayment = mercadoPagoService.createPixPayment(
                order, order.getTotal()
        );

        String qrCode = null;
        String qrCodeText = null;
        String ticketUrl = null;

        if (mpPayment.getPointOfInteraction() != null
                && mpPayment.getPointOfInteraction().getTransactionData() != null) {
            qrCode = mpPayment.getPointOfInteraction()
                    .getTransactionData().getQrCodeBase64();
            qrCodeText = mpPayment.getPointOfInteraction()
                    .getTransactionData().getQrCode();
            ticketUrl = mpPayment.getPointOfInteraction()
                    .getTransactionData().getTicketUrl();
        }

        com.store.candlede.entity.Payment payment =
                com.store.candlede.entity.Payment.builder()
                        .order(order)
                        .transactionId(String.valueOf(mpPayment.getId()))
                        .paymentMethod(PaymentMethod.PIX)
                        .amount(order.getTotal())
                        .status(mapMpStatus(mpPayment.getStatus()))
                        .statusDetail(mpPayment.getStatusDetail())
                        .paymentTypeId("pix")
                        .qrCode(qrCode)
                        .qrCodeText(qrCodeText)
                        .ticketUrl(ticketUrl)
                        .build();

        payment = paymentRepository.save(payment);

        auditService.log(
                "PAYMENT_PIX_CREATED",
                "Payment",
                payment.getId(),
                "PIX real criado via Mercado Pago. Pedido #" + order.getId()
                        + " — MP id: " + mpPayment.getId()
        );

        log.info("✅ PIX REAL criado pra pedido #{} (MP id: {})",
                order.getId(), mpPayment.getId());

        return toResponse(payment);
    }

    // =========================================================
    // CARTÃO — REAL
    // =========================================================
    private PaymentResponse processCard(
            Order order,
            PaymentMethod method,
            CreatePaymentRequest request
    ) {
        String token = request.paymentToken();

        if (token == null || token.isBlank()) {
            throw new BusinessException(
                    "Token do cartão é obrigatório. Tente novamente."
            );
        }

        Payment mpPayment = mercadoPagoService.createCardPayment(
                order,
                order.getTotal(),
                token,
                request.paymentMethodId() != null
                        ? request.paymentMethodId()
                        : "master",
                request.installments() != null
                        ? request.installments()
                        : 1
        );

        PaymentStatus status = mapMpStatus(mpPayment.getStatus());
        boolean aprovado = status == PaymentStatus.APPROVED;

        com.store.candlede.entity.Payment payment =
                com.store.candlede.entity.Payment.builder()
                        .order(order)
                        .transactionId(String.valueOf(mpPayment.getId()))
                        .paymentMethod(method)
                        .amount(order.getTotal())
                        .status(status)
                        .statusDetail(mpPayment.getStatusDetail())
                        .paymentTypeId(mpPayment.getPaymentTypeId())
                        .build();

        payment = paymentRepository.save(payment);

        if (aprovado) {
            order.setPaymentStatus(PaymentStatus.APPROVED);
            order.setStatus(OrderStatus.PREPARING);
        }

        auditService.log(
                aprovado ? "PAYMENT_CARD_APPROVED" : "PAYMENT_CARD_REJECTED",
                "Payment",
                payment.getId(),
                "Cartão " + (aprovado ? "aprovado" : "recusado")
                        + ". Pedido #" + order.getId()
                        + " — " + mpPayment.getStatusDetail()
        );

        log.info("✅ Cartão processado via MP. Pedido #{} — status: {}",
                order.getId(), mpPayment.getStatus());

        return toResponse(payment);
    }

    // =========================================================
    // BUSCAR POR TRANSACTION ID
    // =========================================================
    @Transactional(readOnly = true)
    public PaymentResponse findByTransactionId(String transactionId) {
        com.store.candlede.entity.Payment payment =
                paymentRepository.findByTransactionId(transactionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Pagamento não encontrado.")
                        );
        return toResponse(payment);
    }

    // =========================================================
    // SIMULAR APROVAÇÃO (botão de teste no front)
    // =========================================================
    @Transactional
    public void simulateApproval(String transactionId) {
        com.store.candlede.entity.Payment payment =
                paymentRepository.findByTransactionId(transactionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Transação não encontrada.")
                        );

        if (payment.getStatus() == PaymentStatus.APPROVED) return;

        payment.setStatus(PaymentStatus.APPROVED);
        payment.setStatusDetail("Pagamento aprovado (simulado)");
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        order.setPaymentStatus(PaymentStatus.APPROVED);
        order.setStatus(OrderStatus.PREPARING);

        auditService.log(
                "PAYMENT_SIMULATED",
                "Payment",
                payment.getId(),
                "Pagamento simulado. Pedido #" + order.getId()
        );
    }

    // =========================================================
    // WEBHOOK — MP chama quando pagamento muda de status
    // =========================================================
    @Transactional
    public void handleWebhookRaw(Map<String, Object> payload) {
        try {
            Object dataObj = payload.get("data");
            if (!(dataObj instanceof Map)) return;

            Object idObj = ((Map<?, ?>) dataObj).get("id");
            if (idObj == null) return;

            Long mpId = Long.valueOf(idObj.toString());
            Payment mpPayment = mercadoPagoService.getPayment(mpId);

            String transactionId = String.valueOf(mpPayment.getId());

            com.store.candlede.entity.Payment payment =
                    paymentRepository.findByTransactionId(transactionId)
                            .orElse(null);

            if (payment == null) {
                log.warn("Webhook: transação {} não encontrada", transactionId);
                return;
            }

            PaymentStatus mapped = mapMpStatus(mpPayment.getStatus());
            if (payment.getStatus() == mapped) return;

            payment.setStatus(mapped);
            payment.setStatusDetail(mpPayment.getStatusDetail());
            paymentRepository.save(payment);

            if (mapped == PaymentStatus.APPROVED) {
                Order order = payment.getOrder();
                order.setPaymentStatus(PaymentStatus.APPROVED);
                order.setStatus(OrderStatus.PREPARING);

                auditService.log(
                        "PAYMENT_APPROVED",
                        "Payment",
                        payment.getId(),
                        "Pagamento aprovado via webhook. Pedido #" + order.getId()
                );
            }

            log.info("Webhook MP processado: {} → {}", transactionId, mapped);

        } catch (Exception e) {
            log.error("Erro ao processar webhook MP", e);
        }
    }

    // =========================================================
    // MAPPERS
    // =========================================================
    private PaymentMethod mapPaymentMethod(String method) {
        if (method == null) throw new BusinessException("Método inválido.");
        return switch (method.toLowerCase().trim()) {
            case "pix" -> PaymentMethod.PIX;
            case "credit", "credit_card" -> PaymentMethod.CREDIT_CARD;
            case "debit", "debit_card" -> PaymentMethod.DEBIT_CARD;
            default -> throw new BusinessException("Método inválido: " + method);
        };
    }

    private PaymentStatus mapMpStatus(String mpStatus) {
        if (mpStatus == null) return PaymentStatus.PENDING;
        return switch (mpStatus.toLowerCase()) {
            case "approved" -> PaymentStatus.APPROVED;
            case "pending", "in_process", "authorized" -> PaymentStatus.PENDING;
            case "rejected", "cancelled" -> PaymentStatus.REJECTED;
            case "refunded", "charged_back" -> PaymentStatus.REFUNDED;
            default -> PaymentStatus.PENDING;
        };
    }

    private PaymentResponse toResponse(com.store.candlede.entity.Payment p) {
        return new PaymentResponse(
                p.getId(),
                p.getOrder().getId(),
                p.getTransactionId(),
                p.getPaymentMethod().name(),
                p.getAmount(),
                p.getStatus().name(),
                p.getStatusDetail(),
                p.getPaymentTypeId(),
                p.getQrCode(),
                p.getQrCodeText(),
                p.getTicketUrl(),
                p.getCreatedAt()
        );
    }
}