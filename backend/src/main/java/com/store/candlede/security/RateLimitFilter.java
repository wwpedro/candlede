package com.store.candlede.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // Um bucket por IP
    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> contactBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = getClientIP(request);

        // =========================================================
        // LOGIN / REGISTER — 5 tentativas por minuto por IP
        // =========================================================
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            Bucket bucket = authBuckets.computeIfAbsent(ip, k -> createAuthBucket());
            if (!bucket.tryConsume(1)) {
                reject(response, "Muitas tentativas. Aguarde 1 minuto.");
                return;
            }
        }

        // =========================================================
        // RECUPERAR SENHA — 3 por hora por IP
        // =========================================================
        if (path.startsWith("/api/auth/forgot-password")) {
            Bucket bucket = authBuckets.computeIfAbsent("fp:" + ip, k -> createForgotBucket());
            if (!bucket.tryConsume(1)) {
                reject(response, "Limite de recuperações atingido. Tente mais tarde.");
                return;
            }
        }

        // =========================================================
        // CONTATO — 3 por hora por IP (anti-spam)
        // =========================================================
        if (path.startsWith("/api/contact")) {
            Bucket bucket = contactBuckets.computeIfAbsent(ip, k -> createContactBucket());
            if (!bucket.tryConsume(1)) {
                reject(response, "Você já enviou várias mensagens. Aguarde antes de enviar outra.");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    // =========================================================
    // CONFIGURAÇÕES DOS BALDES
    // =========================================================
    private Bucket createAuthBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1))))
                .build();
    }

    private Bucket createForgotBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(3, Refill.greedy(3, Duration.ofHours(1))))
                .build();
    }

    private Bucket createContactBucket() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(3, Refill.greedy(3, Duration.ofHours(1))))
                .build();
    }

    // =========================================================
    // HELPERS
    // =========================================================
    private String getClientIP(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}