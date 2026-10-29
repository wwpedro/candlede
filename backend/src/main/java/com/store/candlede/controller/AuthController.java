package com.store.candlede.controller;

import com.store.candlede.dto.ForgotPasswordRequest;
import com.store.candlede.dto.LoginRequest;
import com.store.candlede.dto.LoginResponse;
import com.store.candlede.dto.RegisterRequest;
import com.store.candlede.dto.ResetPasswordRequest;
import com.store.candlede.entity.User;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.security.CookieService;
import com.store.candlede.service.AuthService;
import com.store.candlede.service.PasswordResetService;
import com.store.candlede.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;
    private final UserService userService;
    private final PasswordResetService passwordResetService; // <-- ADICIONADO AQUI

    // =========================================================
    // REGISTER
    // =========================================================
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response
    ) {
        LoginResponse login = authService.register(request);
        if (isFinalToken(login)) {
            cookieService.setAuthCookie(response, login.token());
        }
        return login;
    }

    // =========================================================
    // LOGIN
    // =========================================================
    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        LoginResponse login = authService.login(request);
        if (isFinalToken(login)) {
            cookieService.setAuthCookie(response, login.token());
        }
        return login;
    }

    // =========================================================
    // VERIFY 2FA
    // =========================================================
    @PostMapping("/verify-2fa")
    public LoginResponse verify2fa(
            @RequestBody Map<String, String> body,
            HttpServletResponse response
    ) {
        String pendingToken = body.get("pendingToken");
        String code = body.get("code");
        if (pendingToken == null || pendingToken.isBlank() || code == null || code.isBlank()) {
            throw new BusinessException("Dados incompletos.");
        }
        LoginResponse login = authService.verifyTwoFactor(pendingToken, code);
        if (isFinalToken(login)) {
            cookieService.setAuthCookie(response, login.token());
        }
        return login;
    }

    // =========================================================
    // LOGOUT
    // =========================================================
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        cookieService.clearAuthCookie(response);
    }

    // =========================================================
    // ME
    // =========================================================
    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("Não autenticado.");
        }
        User user = userService.getEntityByEmail(authentication.getName());
        return Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        );
    }

    // =========================================================
    // RECUPERAÇÃO DE SENHA (NOVAS ROTAS)
    // =========================================================
    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestReset(request.email());
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
    }

    // =========================================================
    // HELPER
    // =========================================================
    private boolean isFinalToken(LoginResponse login) {
        return login.token() != null
                && !login.token().isBlank()
                && !"PENDING_2FA".equals(login.role());
    }
}