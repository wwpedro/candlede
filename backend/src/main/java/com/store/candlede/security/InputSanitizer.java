package com.store.candlede.security;

import org.owasp.encoder.Encode;
import org.springframework.stereotype.Component;

@Component
public class InputSanitizer {

    /**
     * Remove tags HTML e caracteres perigosos.
     * Usar em: nome, assunto, mensagem de contato, descrição de produto, etc.
     */
    public String sanitizeText(String input) {
        if (input == null) return null;

        // 1. Remove tags HTML por completo
        String noTags = input.replaceAll("<[^>]*>", "");

        // 2. Escapa caracteres perigosos
        String escaped = Encode.forHtmlContent(noTags);

        // 3. Normaliza espaços múltiplos
        return escaped.trim().replaceAll("\\s{2,}", " ");
    }

    /**
     * Versão que permite HTML seguro (para textos institucionais, se um dia precisar).
     * Por enquanto, tudo passa pela versão estrita.
     */
    public String sanitizeHtml(String input) {
        if (input == null) return null;
        return Encode.forHtml(input);
    }

    /**
     * Sanitiza e-mail (só permite caracteres válidos).
     */
    public String sanitizeEmail(String email) {
        if (email == null) return null;
        return email.toLowerCase().trim()
                .replaceAll("[^a-z0-9@._+\\-]", "");
    }

    /**
     * Sanitiza telefone (só dígitos).
     */
    public String sanitizePhone(String phone) {
        if (phone == null) return null;
        return phone.replaceAll("\\D", "");
    }

    /**
     * Sanitiza nome (só letras, espaços e acentos).
     */
    public String sanitizeName(String name) {
        if (name == null) return null;
        return name.trim()
                .replaceAll("[^A-Za-zÀ-ÿ\\s]", "")
                .replaceAll("\\s{2,}", " ");
    }
}