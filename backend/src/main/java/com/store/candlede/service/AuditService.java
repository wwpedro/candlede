package com.store.candlede.service;

import com.store.candlede.entity.AuditLog;
import com.store.candlede.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repo;

    /**
     * Registra uma ação no log.
     * Nunca lança exceção — se falhar, apenas loga no console.
     *
     * @param action   ex: "PRODUCT_CREATE", "LOGIN", "ORDER_STATUS_CHANGE"
     * @param entity   ex: "Product", "Order", "User"
     * @param entityId id do registro afetado (opcional)
     * @param details  detalhes legíveis (opcional)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entity, Long entityId, String details) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            Long userId = null;
            String email = null;
            String role = null;

            if (auth != null && auth.isAuthenticated()
                    && !"anonymousUser".equals(auth.getPrincipal())) {
                email = auth.getName();
                role = auth.getAuthorities().stream()
                        .findFirst()
                        .map(a -> a.getAuthority().replace("ROLE_", ""))
                        .orElse(null);
            }

            AuditLog entry = AuditLog.builder()
                    .userId(userId)
                    .userEmail(email)
                    .userRole(role)
                    .action(action)
                    .entity(entity)
                    .entityId(entityId)
                    .details(details)
                    .ip(getClientIP())
                    .userAgent(getUserAgent())
                    .build();

            repo.save(entry);
        } catch (Exception e) {
            // Nunca deixa o log quebrar a operação principal
            System.err.println("[AUDIT] Falha ao registrar: " + e.getMessage());
        }
    }

    // =========================================================
    // HELPERS
    // =========================================================
    private String getClientIP() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            HttpServletRequest req = attrs.getRequest();
            String xf = req.getHeader("X-Forwarded-For");
            if (xf != null && !xf.isBlank()) return xf.split(",")[0].trim();
            return req.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }

    private String getUserAgent() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            String ua = attrs.getRequest().getHeader("User-Agent");
            if (ua != null && ua.length() > 500) return ua.substring(0, 500);
            return ua;
        } catch (Exception e) {
            return null;
        }
    }
}