package com.store.candlede.service;

import com.store.candlede.dto.LoginRequest;
import com.store.candlede.dto.LoginResponse;
import com.store.candlede.dto.RegisterRequest;
import com.store.candlede.entity.Cart;
import com.store.candlede.entity.User;
import com.store.candlede.enums.Role;
import com.store.candlede.exception.BusinessException;
import com.store.candlede.repository.CartRepository;
import com.store.candlede.repository.UserRepository;
import com.store.candlede.security.JwtService;
import com.store.candlede.security.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final LoginAttemptService loginAttemptService;
    private final AuditService auditService;
    private final TwoFactorService twoFactorService;

    // =========================================================
    // HELPER — pega o IP do cliente
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

    // =========================================================
    // REGISTER
    // =========================================================
    @Transactional
    public LoginResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(
                    "Já existe um usuário cadastrado com este e-mail."
            );
        }

        String firstIp = getClientIP();

        User user = User.builder()
                .name(request.name())
                .email(request.email().toLowerCase().trim())
                .password(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .role(Role.CUSTOMER)
                .active(true)
                .lastLoginIp(firstIp)
                .lastLoginAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        Cart cart = Cart.builder()
                .user(user)
                .build();
        cartRepository.save(cart);

        // =========================================================
        // E-MAIL DE BOAS-VINDAS
        // =========================================================
        try {
            String subject = "Bem-vindo à Candlede";
            String body =
                    "Olá, " + user.getName() + "!\n\n" +
                    "Sua conta na Candlede foi criada com sucesso.\n\n" +
                    "E-mail de acesso: " + user.getEmail() + "\n\n" +
                    "Você já pode fazer login e explorar nossa coleção de velas, " +
                    "perfumes e cremes artesanais.\n\n" +
                    "Se você não fez este cadastro, ignore este e-mail.\n\n" +
                    "Com carinho,\n" +
                    "Equipe Candlede";

            emailService.sendEmail(user.getEmail(), subject, body);
            System.out.println("[CADASTRO] ✅ E-mail enviado para " + user.getEmail());
        } catch (Exception e) {
            System.err.println("[CADASTRO] ❌ Falha ao enviar e-mail: " + e.getMessage());
        }

        // =========================================================
        // AUDITORIA
        // =========================================================
        auditService.log(
                "USER_REGISTER",
                "User",
                user.getId(),
                "Novo cadastro: " + user.getEmail()
        );

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    // =========================================================
    // LOGIN
    // =========================================================
    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.email().toLowerCase().trim();

        // ---------- 1. Verifica bloqueio ----------
        if (loginAttemptService.isBlocked(email)) {
            long min = loginAttemptService.minutesUntilUnlock(email);

            auditService.log(
                    "LOGIN_BLOCKED",
                    "User",
                    null,
                    "Conta bloqueada tentou logar: " + email
            );

            throw new BusinessException(
                    "Conta temporariamente bloqueada por muitas tentativas. " +
                    "Tente novamente em " + min + " minuto(s)."
            );
        }

        // ---------- 2. Busca usuário ----------
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> {
                    loginAttemptService.loginFailed(email);

                    auditService.log(
                            "LOGIN_FAILED",
                            "User",
                            null,
                            "E-mail inexistente: " + email
                    );

                    return new BusinessException("E-mail ou senha inválidos.");
                });

        if (!user.getActive()) {
            throw new BusinessException("Usuário está desativado.");
        }

        // ---------- 3. Autentica ----------
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.password())
            );
        } catch (Exception e) {
            loginAttemptService.loginFailed(email);

            auditService.log(
                    "LOGIN_FAILED",
                    "User",
                    user.getId(),
                    "Senha incorreta para: " + email
            );

            int restam = loginAttemptService.remainingAttempts(email);
            if (restam > 0) {
                throw new BusinessException(
                        "E-mail ou senha inválidos. Você ainda tem " + restam + " tentativa(s)."
                );
            }
            throw new BusinessException(
                    "Muitas tentativas erradas. Conta bloqueada por 15 minutos."
            );
        }

        // ---------- 4. Sucesso ----------
        loginAttemptService.loginSucceeded(email);

        auditService.log(
                "LOGIN",
                "User",
                user.getId(),
                "Login bem-sucedido: " + user.getEmail()
        );

        // ---------- 5. Detecta IP novo ----------
        String currentIp = getClientIP();
        String previousIp = user.getLastLoginIp();

        boolean isNewIp = previousIp != null
                && currentIp != null
                && !previousIp.equals(currentIp);

        if (isNewIp) {
            try {
                String subject = "Novo acesso à sua conta Candlede";
                String body =
                        "Olá, " + user.getName() + "!\n\n" +
                        "Detectamos um login na sua conta Candlede de um dispositivo novo.\n\n" +
                        "IP anterior: " + previousIp + "\n" +
                        "IP atual:    " + currentIp + "\n" +
                        "Data:        " + LocalDateTime.now().format(
                                DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
                        ) + "\n\n" +
                        "Se foi você, ignore este e-mail.\n\n" +
                        "Se NÃO foi você, altere sua senha imediatamente.";

                emailService.sendEmail(user.getEmail(), subject, body);
                System.out.println("[LOGIN] ⚠️  Login de IP novo para " + user.getEmail());
            } catch (Exception e) {
                System.err.println("[LOGIN] Falha ao enviar aviso de IP novo: " + e.getMessage());
            }
        }

        // ---------- 6. Atualiza último IP ----------
        user.setLastLoginIp(currentIp);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // =========================================================
        // 7. SE FOR ADMIN, PEDE 2FA
        // =========================================================
        /*
         * DESATIVADO TEMPORARIAMENTE PARA APRESENTAÇÃO.
         * Para reativar, remova os marcadores de comentário abaixo.
         *
        if (user.getRole() == Role.ADMIN) {
            twoFactorService.sendCode(user);

            auditService.log(
                    "ADMIN_2FA_REQUIRED",
                    "User",
                    user.getId(),
                    "Código 2FA enviado para " + user.getEmail()
            );

            String pendingToken = jwtService.generatePendingTwoFactorToken(user);

            return new LoginResponse(
                    pendingToken,
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    "PENDING_2FA"
            );
        }
        */

        // ---------- 8. Gera token final (todos caem aqui agora) ----------
        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }

    // =========================================================
    // VERIFY 2FA
    // =========================================================
    @Transactional
    public LoginResponse verifyTwoFactor(String pendingToken, String code) {
        if (!jwtService.isPendingTwoFactor(pendingToken)) {
            throw new BusinessException("Token inválido para 2FA.");
        }

        String email = jwtService.extractUsername(pendingToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado."));

        twoFactorService.verifyCode(user.getId(), code);

        String finalToken = jwtService.generateToken(user);

        auditService.log(
                "ADMIN_LOGIN_2FA_OK",
                "User",
                user.getId(),
                "2FA confirmado para " + user.getEmail()
        );

        return new LoginResponse(
                finalToken,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}