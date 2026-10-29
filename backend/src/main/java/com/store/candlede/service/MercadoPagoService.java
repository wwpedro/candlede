package com.store.candlede.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.resources.payment.Payment;
import com.store.candlede.entity.Order;
import com.store.candlede.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class MercadoPagoService {

    @Value("${mercado-pago.access-token}")
    private String accessToken;

    @Value("${mercadopago.sandbox.buyer-email:}")
    private String sandboxBuyerEmail;

    // =========================================================
    // CRIAR PIX
    // =========================================================
    public Payment createPixPayment(Order order, BigDecimal amount) {
        try {
            log.info("=== [MP] Criando PIX ===");
            MercadoPagoConfig.setAccessToken(accessToken);

            String payerEmail = resolverEmailPayer(order);

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(amount)
                    .description("Pedido #" + order.getId() + " — Candlede")
                    .paymentMethodId("pix")
                    .payer(PaymentPayerRequest.builder()
                            .email(payerEmail)
                            .firstName(order.getCustomerName())
                            .build())
                    .externalReference(String.valueOf(order.getId()))
                    .build();
            
            log.info("🔑 TOKEN LIDO: [{}]", accessToken);

            PaymentClient client = new PaymentClient();
            return client.create(request);

        } catch (com.mercadopago.exceptions.MPApiException e) {
            log.error("❌ MPApiException — Status: {}", e.getStatusCode());
            if (e.getApiResponse() != null) {
                log.error("❌ Corpo: {}", e.getApiResponse().getContent());
                log.info("🔑 TOKEN LIDO: [{}]", accessToken);
            }
            throw new BusinessException("Erro MP: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ Erro MP: {}", e.getMessage(), e);
            log.info("🔑 TOKEN LIDO: [{}]", accessToken);
            throw new BusinessException("Erro MP: " + e.getMessage());
        }
    }

    // =========================================================
    // CRIAR PAGAMENTO COM CARTÃO
    // =========================================================
    public Payment createCardPayment(
            Order order,
            BigDecimal amount,
            String cardToken,
            String paymentMethodId,
            Integer installments
    ) {
        try {
            log.info("=== [MP] Criando pagamento com CARTÃO ===");
            log.info("  Order: #{} — Valor: R$ {}", order.getId(), amount);
            log.info("  Token (início): {}", cardToken.substring(0, Math.min(20, cardToken.length())) + "...");
            log.info("  Band: {} — Parcelas: {}", paymentMethodId, installments);

            MercadoPagoConfig.setAccessToken(accessToken);

            String payerEmail = resolverEmailPayer(order);

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(amount)
                    .description("Pedido #" + order.getId() + " — Candlede")
                    .token(cardToken)
                    .paymentMethodId(paymentMethodId)
                    .installments(installments != null ? installments : 1)
                    .payer(PaymentPayerRequest.builder()
                            .email(payerEmail)
                            .firstName(order.getCustomerName())
                            .build())
                    .externalReference(String.valueOf(order.getId()))
                    .build();

            PaymentClient client = new PaymentClient();
            Payment mpPayment = client.create(request);

            log.info("  ✅ Cartão processado! MP id: {} status: {}",
                    mpPayment.getId(), mpPayment.getStatus());

            return mpPayment;

        } catch (com.mercadopago.exceptions.MPApiException e) {
            log.error("❌ MPApiException — Status: {}", e.getStatusCode());
            if (e.getApiResponse() != null) {
                log.error("❌ Corpo: {}", e.getApiResponse().getContent());
            }
            throw new BusinessException("Erro MP: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ Erro MP cartão: {}", e.getMessage(), e);
            throw new BusinessException("Erro MP: " + e.getMessage());
        }
    }

    // =========================================================
    // CONSULTAR
    // =========================================================
    public Payment getPayment(Long mpPaymentId) {
        try {
            MercadoPagoConfig.setAccessToken(accessToken);
            PaymentClient client = new PaymentClient();
            return client.get(mpPaymentId);
        } catch (Exception e) {
            log.error("Erro ao consultar pagamento no MP", e);
            throw new BusinessException("Erro ao consultar pagamento.");
        }
    }

    // =========================================================
    // HELPER
    // =========================================================
    private String resolverEmailPayer(Order order) {
        if (sandboxBuyerEmail != null && !sandboxBuyerEmail.isBlank()) {
            return sandboxBuyerEmail;
        }
        return order.getCustomerEmail();
    }
}