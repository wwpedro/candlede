package com.store.candlede.security;

import com.store.candlede.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration
    ) {

        byte[] keyBytes =
                Decoders.BASE64.decode(secret);

        this.secretKey =
                Keys.hmacShaKeyFor(keyBytes);

        this.expiration = expiration;
    }

    public String generateToken(User user) {

        return Jwts.builder()
                .subject(user.getEmail())

                .claim(
                        "userId",
                        user.getId()
                )

                .claim(
                        "role",
                        user.getRole().name()
                )

                .issuedAt(new Date())

                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + expiration
                        )
                )

                .signWith(secretKey)

                .compact();
    }

    public String extractUsername(
            String token
    ) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    public Long extractUserId(
            String token
    ) {

        Number userId = extractClaim(
                token,
                claims ->
                        claims.get(
                                "userId",
                                Number.class
                        )
        );

        return userId != null
                ? userId.longValue()
                : null;
    }

    public String extractRole(
            String token
    ) {

        return extractClaim(
                token,
                claims ->
                        claims.get(
                                "role",
                                String.class
                        )
        );
    }

    public boolean isTokenValid(
            String token,
            User user
    ) {

        String username =
                extractUsername(token);

        return username.equals(user.getEmail())
                && !isTokenExpired(token);
    }

    public boolean isTokenExpired(
            String token
    ) {

        return extractExpiration(token)
                .before(new Date());
    }

    private Date extractExpiration(
            String token
    ) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }

    public <T> T extractClaim(
            String token,
            Function<Claims, T> resolver
    ) {

        Claims claims =
                extractAllClaims(token);

        return resolver.apply(claims);
    }

    private Claims extractAllClaims(
            String token
    ) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public String generatePendingTwoFactorToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim("pending2fa", true)   // <-- flag especial
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 10 * 60 * 1000))  // 10 min
                .signWith(secretKey)
                .compact();
    }

    public boolean isPendingTwoFactor(String token) {
        Boolean pending = extractClaim(token, c -> c.get("pending2fa", Boolean.class));
        return pending != null && pending;
    }

    public Long extractUserIdFromToken(String token) {
        Number id = extractClaim(token, c -> c.get("userId", Number.class));
        return id != null ? id.longValue() : null;
    }
}