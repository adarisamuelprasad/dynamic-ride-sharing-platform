package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.Payment;
import com.triply.triplybackend.payload.PaymentRequest;
import com.triply.triplybackend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*") // Allow frontend access
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody PaymentRequest paymentRequest) {
        try {
            Payment payment = paymentService.processPayment(paymentRequest);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Payment Failed: " + e.getMessage());
        }
    }

    @GetMapping("/history/passenger/{userId}")
    public ResponseEntity<List<Payment>> getPassengerHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPassengerHistory(userId));
    }

    @GetMapping("/history/driver/{userId}")
    public ResponseEntity<List<Payment>> getDriverHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getDriverHistory(userId));
    }

    @GetMapping("/report")
    public ResponseEntity<?> getReport(@RequestParam Long userId, @RequestParam String role) {
        return ResponseEntity.ok(paymentService.getPaymentReport(userId, role));
    }
}
