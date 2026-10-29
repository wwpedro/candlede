package com.store.candlede.service;

import com.store.candlede.exception.BusinessException;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
public class ShippingService {

    // Mude aqui o valor mínimo para dar Frete Grátis!
    private static final BigDecimal VALOR_FRETE_GRATIS = new BigDecimal("250.00");

    public BigDecimal calcularFrete(String cep, BigDecimal subtotal) {
        // 1. Se o subtotal for alto, o frete é grátis
        if (subtotal.compareTo(VALOR_FRETE_GRATIS) >= 0) {
            return BigDecimal.ZERO;
        }

        // 2. Limpa o CEP (remove traço, espaço, etc)
        String cepNumeros = cep.replaceAll("\\D", "");

        if (cepNumeros.length() != 8) {
            throw new BusinessException("CEP inválido para cálculo de frete.");
        }

        // 3. Pega os 2 primeiros dígitos do CEP
        int prefixo = Integer.parseInt(cepNumeros.substring(0, 2));

        // 4. Regras de frete por região (Origem: Maceió - AL)
        if (prefixo >= 40 && prefixo <= 65) {
            return new BigDecimal("15.00"); // Nordeste (Mais perto)
        } 
        else if ((prefixo >= 1 && prefixo <= 39) || (prefixo >= 70 && prefixo <= 79)) {
            return new BigDecimal("25.00"); // Sudeste e Centro-Oeste
        } 
        else if (prefixo >= 80 && prefixo <= 99) {
            return new BigDecimal("30.00"); // Sul
        } 
        else if (prefixo >= 66 && prefixo <= 69) {
            return new BigDecimal("35.00"); // Norte (Mais longe)
        }

        return new BigDecimal("25.00"); // Valor padrão caso dê erro no cálculo
    }
}