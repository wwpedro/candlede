package com.store.candlede.service;

import com.store.candlede.dto.ShippingOption;
import com.store.candlede.entity.CartItem;
import com.store.candlede.entity.Product;
import com.store.candlede.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MelhorEnvioService {

    @Value("${melhorenvio.token}")
    private String token;

    @Value("${melhorenvio.base-url:https://sandbox.melhorenvio.com.br}")
    private String baseUrl;

    private final RestTemplate restTemplate;

    public MelhorEnvioService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @SuppressWarnings("unchecked")
    public List<ShippingOption> calculateShipping(String originCep, String destinationCep, List<CartItem> items) {
        
        // 1. Monta o Payload
        Map<String, Object> payload = new HashMap<>();
        payload.put("from", Map.of("postal_code", originCep.replaceAll("\\D", "")));
        payload.put("to", Map.of("postal_code", destinationCep.replaceAll("\\D", "")));

        // AQUI ESTÁ A CORREÇÃO (Usando HashMap em vez de Map.of)
        List<Map<String, Object>> productsPayload = items.stream().map(item -> {
            Product p = item.getProduct();
            
            Map<String, Object> productMap = new HashMap<>();
            productMap.put("id", p.getId().toString());
            productMap.put("width", p.getWidth() != null ? p.getWidth() : 11.0);
            productMap.put("height", p.getHeight() != null ? p.getHeight() : 11.0);
            productMap.put("length", p.getLength() != null ? p.getLength() : 11.0);
            productMap.put("weight", p.getWeight() != null ? p.getWeight() : 0.3);
            productMap.put("insurance_value", p.getPrice().doubleValue());
            productMap.put("quantity", item.getQuantity());
            
            return productMap;
        }).toList();
        
        payload.put("products", productsPayload);

        // 2. Configura os Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");
        headers.set("User-Agent", "Candlede (candledecontato@gmail.com)");
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        // 3. Faz a requisição
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                baseUrl + "/api/v2/me/shipment/calculate",
                HttpMethod.POST,
                request,
                new ParameterizedTypeReference<>() {}
            );

            List<Map<String, Object>> body = response.getBody();
            if (body == null) return List.of();

            // 4. Mapeia a resposta
            return body.stream()
                .filter(opt -> opt.get("error") == null) // Ignora serviços indisponíveis
                .map(opt -> {
                    Map<String, Object> company = (Map<String, Object>) opt.get("company");
                    return new ShippingOption(
                        (String) opt.get("name"),
                        company != null ? (String) company.get("name") : "Transportadora",
                        new BigDecimal(opt.get("custom_price").toString()),
                        (Integer) opt.get("custom_delivery_time")
                    );
                })
                .toList();

        } catch (Exception e) {
            throw new BusinessException("Erro ao calcular frete no Melhor Envio: " + e.getMessage());
        }
    }
}