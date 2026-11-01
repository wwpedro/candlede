package com.store.candlede.config;

import com.store.candlede.security.CustomUserDetailsService;
import com.store.candlede.security.JwtAuthenticationFilter;
import com.store.candlede.security.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;
    private final CustomUserDetailsService userDetailsService;

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // AUTHENTICATION PROVIDER
    // =========================================================
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {
        return configuration.getAuthenticationManager();
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

            // -------------------------------------------------
            // JWT = API STATELESS
            // -------------------------------------------------
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // -------------------------------------------------
            // CORS
            // -------------------------------------------------
            .cors(cors -> {})

            // -------------------------------------------------
            // CSRF — desabilitado porque é API JWT (stateless)
            // -------------------------------------------------
            .csrf(csrf -> csrf.disable())

            // -------------------------------------------------
            // SECURITY HEADERS
            // -------------------------------------------------
            .headers(headers -> headers
                // Não permite o navegador "adivinhar" o tipo do conteúdo
                .contentTypeOptions(opt -> {})

                // Bloqueia iframe (evita clickjacking)
                .frameOptions(frame -> frame.deny())

                // Não envia Referer pra outros sites
                .referrerPolicy(ref -> ref.policy(
                        ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER
                ))

                // Bloqueia XSS em navegadores antigos
                .xssProtection(xss -> xss.headerValue(
                        XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK
                ))

                // CSP — bloqueia scripts inline não autorizados
                // Em produção, troca localhost:5173 e localhost:8081 pelas URLs reais
                .contentSecurityPolicy(csp -> csp
                	    .policyDirectives(
                	        "default-src 'self'; " +
                	        "img-src 'self' data: blob: http://localhost:8081; " +
                	        "media-src 'self' blob: http://localhost:8081; " +
                	        "script-src 'self'; " +
                	        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                	        "font-src 'self' https://fonts.gstatic.com; " +
                	        "connect-src 'self' http://localhost:8081"
                	    )
                	)

                // HSTS — DESCOMENTE SÓ EM PRODUÇÃO COM HTTPS
                // .httpStrictTransportSecurity(hsts -> hsts
                //         .includeSubDomains(true)
                //         .maxAgeInSeconds(31536000)
                // )
            )

            // -------------------------------------------------
            // AUTORIZAÇÃO
            // -------------------------------------------------
            .authorizeHttpRequests(auth -> auth

                // =========================================
                // ROTAS DE AUTENTICAÇÃO (públicas)
                // =========================================
                .requestMatchers("/api/auth/**").permitAll()

                // =========================================
                // PRODUTOS (público — só GET)
                // =========================================
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/products/**"
                ).permitAll()

                // =========================================
                // CATEGORIAS (público — só GET)
                // =========================================
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/categories/**"
                ).permitAll()

                // =========================================
                // CONTEÚDO INSTITUCIONAL (público)
                // =========================================
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/content/**"
                ).permitAll()

                // =========================================
                // BANNERS (público)
                // =========================================
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/banners/**"
                ).permitAll()

                // =========================================
                // ARQUIVOS ESTÁTICOS (imagens/vídeos dos produtos)
                // =========================================
                .requestMatchers("/uploads/**").permitAll()

                // =========================================
                // CONTATO (público — só POST)
                // =========================================
                .requestMatchers(
                        HttpMethod.POST,
                        "/api/contact"
                ).permitAll()
                
                .requestMatchers("/api/payments/simulate/**").permitAll()
                
                // =========================================
                // NOVO: WEBHOOK MERCADO PAGO (Público)
                // =========================================
                .requestMatchers(HttpMethod.POST, "/api/payments/webhook").permitAll()

                // =========================================
                // ÁREA DO ADMIN
                // =========================================
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/sitemap.xml", "/api/sitemap.xml").permitAll()

                // =========================================
                // ÁREA DO CLIENTE
                // =========================================
                .requestMatchers("/api/cart/**").hasRole("CUSTOMER")
                .requestMatchers("/api/orders/**").hasRole("CUSTOMER")
                .requestMatchers("/api/users/**").hasRole("CUSTOMER")
                .requestMatchers("/api/payments/**").hasRole("CUSTOMER")
                
                // ADICIONE ESTA LINHA AQUI PARA O FRETE:
                .requestMatchers("/api/shipping/**").hasRole("CUSTOMER")
                
             // =========================================
             // BLOQUEAR ROTAS TÉCNICAS
             // =========================================
             .requestMatchers(
                 "/actuator/**",
                 "/error/**",
                 "/swagger-ui/**",
                 "/v3/api-docs/**",
                 "/h2-console/**"
             ).denyAll()
             
                // =========================================
                // QUALQUER OUTRA ROTA
                // =========================================
                .anyRequest().authenticated()
            )

            // -------------------------------------------------
            // AUTHENTICATION PROVIDER
            // -------------------------------------------------
            .authenticationProvider(authenticationProvider())

            // -------------------------------------------------
            // RATE LIMIT FILTER (antes do JWT)
            // -------------------------------------------------
            .addFilterBefore(
                    rateLimitFilter,
                    UsernamePasswordAuthenticationFilter.class
            )

            // -------------------------------------------------
            // JWT FILTER
            // -------------------------------------------------
            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}