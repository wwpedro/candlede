package com.store.candlede.controller;

import com.store.candlede.dto.CreatePaymentRequest;
import com.store.candlede.dto.PaymentResponse;
import com.store.candlede.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse process(@Valid @RequestBody CreatePaymentRequest request) {
        return paymentService.processPayment(request);
    }

    @GetMapping("/{transactionId}")
    public PaymentResponse find(@PathVariable String transactionId) {
        return paymentService.findByTransactionId(transactionId);
    }

    @PostMapping("/simulate/{transactionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void simulateApproval(@PathVariable String transactionId) {
        paymentService.simulateApproval(transactionId);
    }

    @PostMapping("/webhook")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void webhook(@RequestBody Map<String, Object> payload) {
        paymentService.handleWebhookRaw(payload);
    }
}