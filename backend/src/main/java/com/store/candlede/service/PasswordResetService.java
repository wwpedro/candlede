package com.store.candlede.service;

import com.store.candlede.entity.PasswordResetToken;
import com.store.candlede.entity.User;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.repository.PasswordResetTokenRepository;
import com.store.candlede.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public void requestReset(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElse(null);
        if (user == null) return; // não revela se existe

        // Limpa tokens antigos
        tokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusHours(2))
                .used(false)
                .build();
        
        // Salva o token no banco ANTES de tentar enviar o e-mail
        tokenRepository.save(prt);

        String link = frontendUrl + "/redefinir-senha/" + token;

        // =========================================================
        // BLOCO DE ENVIO DO E-MAIL (Protegido contra falhas)
        // =========================================================
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(user.getEmail());
            msg.setSubject("Candlede — Redefinir senha");
            msg.setText(
                "Olá, " + user.getName() + "!\n\n" +
                "Recebemos um pedido para redefinir sua senha.\n\n" +
                "Clique no link abaixo (válido por 2 horas):\n" + link + "\n\n" +
                "Se você não pediu isso, ignore este e-mail."
            );
            mailSender.send(msg);
            System.out.println("[EMAIL] Link enviado com sucesso para: " + user.getEmail());
        } catch (Exception e) {
            // Se falhar, o sistema NÃO quebra. Só avisa no console.
            System.err.println("[ERRO EMAIL] Falha ao enviar link para " + user.getEmail());
            System.err.println("[ERRO EMAIL] Motivo: " + e.getMessage());
            System.out.println("[DEBUG] Link de recuperação gerado (copie e cole no navegador): " + link);
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Token inválido."));

        if (prt.getUsed())
            throw new BusinessException("Este link já foi utilizado.");

        if (prt.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new BusinessException("Este link expirou.");

        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        prt.setUsed(true);
        tokenRepository.save(prt);
    }
}