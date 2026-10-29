package com.store.candlede.service;

import com.store.candlede.entity.AdminTwoFactorCode;
import com.store.candlede.entity.User;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.repository.AdminTwoFactorCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TwoFactorService {

    private final AdminTwoFactorCodeRepository repo;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int EXPIRY_MINUTES = 10;

    @Transactional
    public void sendCode(User user) {
        // Limpa códigos antigos
        repo.deleteByUserId(user.getId());

        // Gera 6 dígitos
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        AdminTwoFactorCode entity = AdminTwoFactorCode.builder()
                .user(user)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES))
                .used(false)
                .build();

        repo.save(entity);

        String subject = "Código de acesso — Candlede Admin";
        String body =
                "Olá, " + user.getName() + "!\n\n" +
                "Seu código de verificação é:\n\n" +
                "    " + code + "\n\n" +
                "Válido por " + EXPIRY_MINUTES + " minutos.\n\n" +
                "Se você não tentou logar, altere sua senha imediatamente.";

        try {
            emailService.sendEmail(user.getEmail(), subject, body);
            System.out.println("[2FA] Código enviado para " + user.getEmail() + ": " + code);
        } catch (Exception e) {
            System.err.println("[2FA] Falha ao enviar código: " + e.getMessage());
            System.err.println("[2FA] CÓDIGO (modo debug): " + code);
        }
    }

    @Transactional
    public void verifyCode(Long userId, String code) {
        AdminTwoFactorCode entity = repo
                .findTopByUserIdAndUsedFalseOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new BusinessException("Nenhum código pendente."));

        if (entity.isExpired()) {
            throw new BusinessException("Código expirado. Faça login novamente.");
        }

        if (!entity.getCode().equals(code)) {
            throw new BusinessException("Código inválido.");
        }

        entity.setUsed(true);
        repo.save(entity);
    }
}