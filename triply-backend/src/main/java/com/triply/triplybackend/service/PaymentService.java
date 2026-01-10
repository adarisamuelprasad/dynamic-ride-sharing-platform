package com.triply.triplybackend.service;

import com.triply.triplybackend.model.Booking;
import com.triply.triplybackend.model.Payment;
import com.triply.triplybackend.model.User;
import com.triply.triplybackend.payload.PaymentRequest;
import com.triply.triplybackend.repository.BookingRepository;
import com.triply.triplybackend.repository.PaymentRepository;
import com.triply.triplybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ReportService reportService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public Payment processPayment(PaymentRequest request) {
        if (request.getBookingId() == null) {
            throw new RuntimeException("Booking ID cannot be null");
        }
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // 1. Mock Payment Processing (Simulate success)
        // In a real app, we would call StripeService.charge(request.getStripeToken(),
        // request.getAmount())
        String transactionId = "txn_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        // 2. Create Payment Record
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setCreatedAt(LocalDateTime.now());
        payment.setStatus("COMPLETED");
        payment.setType("BOOKING_PAYMENT");
        payment.setTransactionId(transactionId);

        paymentRepository.save(payment);

        // 3. Update Booking Status
        booking.setStatus("CONFIRMED");
        booking.setPaymentMethod(request.getPaymentMethod());
        bookingRepository.save(booking);

        // 4. Sync Driver Wallet
        User driver = booking.getRide().getDriver();
        if (driver != null) {
            Double currentBalance = driver.getWalletBalance() != null ? driver.getWalletBalance() : 0.0;
            driver.setWalletBalance(currentBalance + request.getAmount());
            userRepository.save(driver);
        }

        // 5. Send Notifications & Email
        try {
            // Notify Passenger
            String msg = "Payment of ₹" + payment.getAmount() + " successful.";
            java.util.Map<String, Object> details = new java.util.HashMap<>();
            details.put("paymentId", payment.getId());
            details.put("amount", payment.getAmount());
            details.put("transactionId", transactionId);

            notificationService.sendDetailedNotification(
                    booking.getPassenger().getEmail(),
                    "PAYMENT_SUCCESS",
                    msg,
                    booking.getId(),
                    details);

            // Send Ticket Email
            byte[] ticketPdf = reportService.generateTicketPDF(payment);
            emailService.sendTicketEmail(
                    booking.getPassenger().getEmail(),
                    "Triply Ticket - Payment Successful",
                    "<h1>Payment Successful</h1><p>Your payment for ride from " + booking.getRide().getSource() + " to "
                            + booking.getRide().getDestination()
                            + " was successful.</p><p>Please find your ticket attached.</p>",
                    ticketPdf);

        } catch (Exception e) {
            System.err.println("Failed to send payment notifications: " + e.getMessage());
            e.printStackTrace();
        }

        return payment;
    }

    public List<Payment> getPassengerHistory(Long userId) {
        return paymentRepository.findByBooking_Passenger_Id(userId);
    }

    public List<Payment> getDriverHistory(Long driverId) {
        return paymentRepository.findByBooking_Ride_Driver_Id(driverId);
    }

    public com.triply.triplybackend.payload.PaymentReportResponse getPaymentReport(Long userId, String role) {
        com.triply.triplybackend.payload.PaymentReportResponse report = new com.triply.triplybackend.payload.PaymentReportResponse();

        if ("ROLE_ADMIN".equals(role)) {
            List<Payment> allPayments = paymentRepository.findAll();
            report.setTransactions(allPayments);
            report.setTotalTransactions((long) allPayments.size());
            double revenue = allPayments.stream().mapToDouble(Payment::getAmount).sum();
            report.setTotalRevenue(revenue);
        } else if ("ROLE_DRIVER".equals(role)) {
            List<Payment> driverPayments = paymentRepository.findByBooking_Ride_Driver_Id(userId);
            report.setEarningsHistory(driverPayments); // Drivers see earnings
            report.setTransactions(driverPayments);
            double earnings = driverPayments.stream().mapToDouble(Payment::getAmount).sum();
            report.setTotalEarnings(earnings);

            User driver = userRepository.findById(userId).orElse(null);
            if (driver != null) {
                report.setWalletBalance(driver.getWalletBalance());
            }
        } else {
            // Passenger
            List<Payment> passengerPayments = paymentRepository.findByBooking_Passenger_Id(userId);
            report.setTransactions(passengerPayments);
            double spent = passengerPayments.stream().mapToDouble(Payment::getAmount).sum();
            report.setTotalSpent(spent);
        }

        return report;
    }
}
