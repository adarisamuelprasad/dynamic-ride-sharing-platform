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

    @Transactional
    public Payment processPayment(PaymentRequest request) {
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

        return payment;
    }

    public List<Payment> getPassengerHistory(Long userId) {
        return paymentRepository.findByPassengerId(userId);
    }

    public List<Payment> getDriverHistory(Long driverId) {
        return paymentRepository.findByDriverId(driverId);
    }
}
