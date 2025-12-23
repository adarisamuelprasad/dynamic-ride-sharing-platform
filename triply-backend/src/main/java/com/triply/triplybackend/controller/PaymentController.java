package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.Payment;
import com.triply.triplybackend.model.User;
import com.triply.triplybackend.repository.PaymentRepository;
import com.triply.triplybackend.repository.UserRepository;
import com.triply.triplybackend.service.ReportService;
import com.triply.triplybackend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:8080" }, allowCredentials = "true")
@SuppressWarnings("null")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private ReportService reportService;

    @GetMapping("/history")
    public ResponseEntity<?> getTransactionHistory(HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Long userId = jwtUtil.getClaims(token).get("uid", Long.class);
        String role = jwtUtil.getClaims(token).get("role", String.class);

        List<Payment> allPayments = paymentRepository.findAll();

        // Filter by user
        List<Payment> userPayments;
        if ("ROLE_ADMIN".equals(role)) {
            userPayments = allPayments;
        } else if ("ROLE_DRIVER".equals(role)) {
            userPayments = allPayments.stream()
                    .filter(p -> p.getBooking() != null && p.getBooking().getRide() != null &&
                            p.getBooking().getRide().getDriver().getId().equals(userId))
                    .collect(Collectors.toList());
        } else {
            userPayments = allPayments.stream()
                    .filter(p -> p.getBooking() != null && p.getBooking().getPassenger().getId().equals(userId))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(userPayments);
    }

    @GetMapping("/report")
    public ResponseEntity<?> getReport(HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Long userId = jwtUtil.getClaims(token).get("uid", Long.class);
        String role = jwtUtil.getClaims(token).get("role", String.class);

        List<Payment> allPayments = paymentRepository.findAll();

        Map<String, Object> report;
        if ("ROLE_ADMIN".equals(role)) {
            double totalRevenue = allPayments.stream()
                    .filter(p -> "BOOKING_PAYMENT".equals(p.getType()) && "PAID".equals(p.getStatus()))
                    .mapToDouble(Payment::getAmount).sum();

            long totalTransactions = allPayments.size();

            report = Map.of(
                    "totalRevenue", totalRevenue,
                    "totalTransactions", totalTransactions,
                    "transactions", allPayments);
        } else if ("ROLE_DRIVER".equals(role)) {
            User driver = userRepository.findById(userId).orElseThrow();
            double totalEarnings = allPayments.stream()
                    .filter(p -> "WALLET_RELEASE".equals(p.getType()) && p.getBooking() != null &&
                            p.getBooking().getRide().getDriver().getId().equals(userId))
                    .mapToDouble(Payment::getAmount).sum();

            report = Map.of(
                    "walletBalance", driver.getWalletBalance(),
                    "totalEarnings", totalEarnings,
                    "earningsHistory", allPayments.stream()
                            .filter(p -> p.getBooking() != null
                                    && p.getBooking().getRide().getDriver().getId().equals(userId))
                            .collect(Collectors.toList()));
        } else {
            double totalSpent = allPayments.stream()
                    .filter(p -> "BOOKING_PAYMENT".equals(p.getType()) && p.getBooking() != null &&
                            p.getBooking().getPassenger().getId().equals(userId))
                    .mapToDouble(Payment::getAmount).sum();

            report = Map.of(
                    "totalSpent", totalSpent,
                    "bookings", allPayments.stream()
                            .filter(p -> p.getBooking() != null && p.getBooking().getPassenger().getId().equals(userId))
                            .collect(Collectors.toList()));
        }

        return ResponseEntity.ok(report);
    }

    @GetMapping("/download")
    public ResponseEntity<String> downloadReport(HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Long userId = jwtUtil.getClaims(token).get("uid", Long.class);
        String role = jwtUtil.getClaims(token).get("role", String.class);

        List<Payment> allPayments = paymentRepository.findAll();
        List<Payment> userPayments;

        if ("ROLE_ADMIN".equals(role)) {
            userPayments = allPayments;
        } else if ("ROLE_DRIVER".equals(role)) {
            userPayments = allPayments.stream()
                    .filter(p -> p.getBooking() != null && p.getBooking().getRide() != null &&
                            p.getBooking().getRide().getDriver().getId().equals(userId))
                    .collect(Collectors.toList());
        } else {
            userPayments = allPayments.stream()
                    .filter(p -> p.getBooking() != null && p.getBooking().getPassenger().getId().equals(userId))
                    .collect(Collectors.toList());
        }

        String csv = reportService.generatePaymentCSV(userPayments);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=payment_report.csv")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(csv);
    }
}
