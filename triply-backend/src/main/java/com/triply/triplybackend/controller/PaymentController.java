package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.Payment;
import com.triply.triplybackend.model.User;
import com.triply.triplybackend.repository.PaymentRepository;
import com.triply.triplybackend.repository.UserRepository;
import com.triply.triplybackend.service.ReportService;
import com.triply.triplybackend.repository.BookingRepository;
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
    private BookingRepository bookingRepository;

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

    /**
     * Mark a Stripe payment as paid and release funds to the driver's wallet.
     */
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmStripePayment(@RequestBody Map<String, String> payload, HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        String paymentIntentId = payload.get("paymentIntentId");
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            return ResponseEntity.badRequest().body("paymentIntentId is required");
        }

        var paymentOpt = paymentRepository.findByTransactionId(paymentIntentId);
        if (paymentOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Payment not found for transaction id");
        }

        Payment payment = paymentOpt.get();
        payment.setStatus("PAID");
        paymentRepository.save(payment);

        // Release to driver wallet once per booking
        if (payment.getBooking() != null && payment.getBooking().getRide() != null) {
            Long bookingId = payment.getBooking().getId();
            boolean alreadyReleased = paymentRepository
                    .findByBooking_IdAndType(bookingId, "WALLET_RELEASE")
                    .isPresent();

            if (!alreadyReleased) {
                double amount = payment.getAmount();

                Payment transfer = new Payment();
                transfer.setBooking(payment.getBooking());
                transfer.setAmount(amount);
                transfer.setStatus("TRANSFERRED");
                transfer.setType("WALLET_RELEASE");
                transfer.setTransactionId("WLT-" + System.currentTimeMillis() + "-" + bookingId);
                paymentRepository.save(transfer);

                User driver = payment.getBooking().getRide().getDriver();
                driver.setWalletBalance((driver.getWalletBalance() != null ? driver.getWalletBalance() : 0.0) + amount);
                userRepository.save(driver);

                // Mark booking as completed to keep history consistent
                payment.getBooking().setStatus("COMPLETED");
                bookingRepository.save(payment.getBooking());
            }
        }

        return ResponseEntity.ok("Payment confirmed and wallet updated");
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

    @GetMapping("/download/pdf")
    public ResponseEntity<byte[]> downloadReportPdf(HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(null);
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body(null);
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

        byte[] pdf = reportService.generatePaymentPDF(userPayments);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=payment_report.pdf")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(pdf);
    }

    @GetMapping("/receipt/{bookingId}")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long bookingId, HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(null);
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body(null);
        }
        Long requesterId = jwtUtil.getClaims(token).get("uid", Long.class);
        String role = jwtUtil.getClaims(token).get("role", String.class);

        var bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body(null);
        }
        var booking = bookingOpt.get();

        boolean allowed = "ROLE_ADMIN".equals(role)
                || (booking.getPassenger() != null && booking.getPassenger().getId().equals(requesterId))
                || (booking.getRide() != null && booking.getRide().getDriver() != null
                        && booking.getRide().getDriver().getId().equals(requesterId));
        if (!allowed) {
            return ResponseEntity.status(403).body(null);
        }

        var paymentOpt = paymentRepository.findByBooking_Id(bookingId);
        Payment payment = paymentOpt.orElse(null);

        byte[] pdf = reportService.generatePaymentReceiptPDF(booking, payment);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=payment_receipt_" + bookingId + ".pdf")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/pdf")
                .body(pdf);
    }
}
