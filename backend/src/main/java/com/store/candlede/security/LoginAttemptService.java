package com.store.candlede.security;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCK_MINUTES = 15;

    // Chave = e-mail (minúsculo) | Valor = tentativas + data do bloqueio
    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    public void loginSucceeded(String email) {
        attempts.remove(email.toLowerCase());
    }

    public void loginFailed(String email) {
        String key = email.toLowerCase();
        Attempt a = attempts.getOrDefault(key, new Attempt(0, null));
        a.count++;
        if (a.count >= MAX_ATTEMPTS) {
            a.lockedUntil = LocalDateTime.now().plusMinutes(LOCK_MINUTES);
        }
        attempts.put(key, a);
    }

    public boolean isBlocked(String email) {
        Attempt a = attempts.get(email.toLowerCase());
        if (a == null || a.lockedUntil == null) return false;
        if (LocalDateTime.now().isAfter(a.lockedUntil)) {
            attempts.remove(email.toLowerCase());
            return false;
        }
        return true;
    }

    public long minutesUntilUnlock(String email) {
        Attempt a = attempts.get(email.toLowerCase());
        if (a == null || a.lockedUntil == null) return 0;
        return Duration.between(LocalDateTime.now(), a.lockedUntil).toMinutes() + 1;
    }

    public int remainingAttempts(String email) {
        Attempt a = attempts.get(email.toLowerCase());
        if (a == null) return MAX_ATTEMPTS;
        return Math.max(0, MAX_ATTEMPTS - a.count);
    }

    private static class Attempt {
        int count;
        LocalDateTime lockedUntil;

        Attempt(int count, LocalDateTime lockedUntil) {
            this.count = count;
            this.lockedUntil = lockedUntil;
        }
    }
}