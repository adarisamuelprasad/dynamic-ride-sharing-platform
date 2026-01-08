package com.triply.triplybackend.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        if (stripeApiKey != null && !stripeApiKey.isEmpty()) {
            Stripe.apiKey = stripeApiKey;
        }
    }

    public Map<String, String> createPaymentIntent(double amount, String currency) throws Exception {
        if (stripeApiKey == null || stripeApiKey.isEmpty()) {
            // Mock response if no API key is provided
            Map<String, String> mockResponse = new HashMap<>();
            mockResponse.put("id", "pi_mock_" + System.currentTimeMillis());
            mockResponse.put("clientSecret", "pi_mock_secret_" + System.currentTimeMillis());
            return mockResponse;
        }

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount((long) (amount * 100)) // Amount in cents
                .setCurrency(currency)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Map<String, String> response = new HashMap<>();
        response.put("id", intent.getId());
        response.put("clientSecret", intent.getClientSecret());
        return response;
    }
}
