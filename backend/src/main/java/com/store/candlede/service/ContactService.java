package com.store.candlede.service;

import com.store.candlede.dto.ContactMessageResponse;
import com.store.candlede.dto.CreateContactMessageRequest;
import com.store.candlede.entity.ContactMessage;
import com.store.candlede.exception.ResourceNotFoundException;
import com.store.candlede.repository.ContactMessageRepository;
import com.store.candlede.security.InputSanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository repository;
    private final JavaMailSender mailSender;
    private final AuditService auditService;        // <-- NOVO
    private final InputSanitizer sanitizer;         // <-- NOVO

    @Value("${app.contact.email:candlede@gmail.com}")
    private String contactEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    // =========================================================
    // CRIAR
    // =========================================================
    @Transactional
    public ContactMessageResponse create(CreateContactMessageRequest req) {

        // ===== SANITIZA OS INPUTS =====
        String safeName = sanitizer.sanitizeName(req.name());
        String safeEmail = sanitizer.sanitizeEmail(req.email());
        String safeSubject = req.subject() != null
                ? sanitizer.sanitizeText(req.subject())
                : null;
        String safeMessage = sanitizer.sanitizeText(req.message());

        ContactMessage msg = ContactMessage.builder()
                .name(safeName)
                .email(safeEmail)
                .subject(safeSubject)
                .message(safeMessage)
                .read(false)
                .build();

        msg = repository.save(msg);

        // Tenta enviar e-mail pro admin (não quebra se falhar)
        trySendNotification(msg);

        // ===== AUDITORIA =====
        auditService.log(
                "CONTACT_CREATE",
                "ContactMessage",
                msg.getId(),
                "Nova mensagem de " + safeName + " <" + safeEmail + ">"
        );

        return toResponse(msg);
    }

    private void trySendNotification(ContactMessage msg) {
        if (mailUsername == null || mailUsername.isBlank()) {
            System.out.println("[CONTATO] Nova mensagem de " + msg.getEmail()
                    + " (SMTP não configurado — não enviado por e-mail)");
            return;
        }

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(contactEmail);
            mail.setReplyTo(msg.getEmail());
            mail.setSubject("Contato Candlede — " + msg.getName());
            mail.setText(
                    "Nome: " + msg.getName() + "\n" +
                    "E-mail: " + msg.getEmail() + "\n" +
                    (msg.getSubject() != null ? "Assunto: " + msg.getSubject() + "\n" : "") +
                    "\nMensagem:\n" + msg.getMessage()
            );
            mailSender.send(mail);
            System.out.println("[CONTATO] E-mail enviado para " + contactEmail);
        } catch (Exception e) {
            System.err.println("[CONTATO] Falha ao enviar e-mail: " + e.getMessage());
        }
    }

    // =========================================================
    // LISTAR (admin)
    // =========================================================
    @Transactional(readOnly = true)
    public List<ContactMessageResponse> findAll() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countUnread() {
        return repository.countByReadFalse();
    }

    // =========================================================
    // MARCAR COMO LIDA
    // =========================================================
    @Transactional
    public void markAsRead(Long id) {
        ContactMessage msg = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensagem não encontrada."));

        if (Boolean.TRUE.equals(msg.getRead())) {
            return; // já estava lida, não faz nada
        }

        msg.setRead(true);
        repository.save(msg);

        auditService.log(
                "CONTACT_MARK_READ",
                "ContactMessage",
                id,
                "Marcou como lida: " + msg.getName()
        );
    }

    // =========================================================
    // DELETAR
    // =========================================================
    @Transactional
    public void delete(Long id) {
        ContactMessage msg = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mensagem não encontrada."));

        // Guarda o nome ANTES de deletar (pra logar)
        String sender = msg.getName();

        repository.deleteById(id);

        auditService.log(
                "CONTACT_DELETE",
                "ContactMessage",
                id,
                "Excluiu mensagem de: " + sender
        );
    }

    private ContactMessageResponse toResponse(ContactMessage m) {
        return new ContactMessageResponse(
                m.getId(),
                m.getName(),
                m.getEmail(),
                m.getSubject(),
                m.getMessage(),
                m.getRead(),
                m.getCreatedAt()
        );
    }
}