package com.store.candlede.repository;

import com.store.candlede.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    List<Payment> findByOrderIdAndStatus(Long orderId, String status);
}