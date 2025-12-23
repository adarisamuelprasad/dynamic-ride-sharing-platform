package com.triply.triplybackend.repository;

import com.triply.triplybackend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBooking_Id(Long bookingId);

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByBooking_IdAndType(Long bookingId, String type);
}
