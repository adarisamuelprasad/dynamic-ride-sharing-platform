package com.triply.triplybackend.repository;

import com.triply.triplybackend.model.Payment;
import com.triply.triplybackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find all payments by passenger (via booking)
    @Query("SELECT p FROM Payment p JOIN p.booking b WHERE b.passenger.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findByPassengerId(@Param("userId") Long userId);

    // Find all payments for a driver's rides (via booking -> ride -> driver)
    @Query("SELECT p FROM Payment p JOIN p.booking b JOIN b.ride r WHERE r.driver.id = :driverId ORDER BY p.createdAt DESC")
    List<Payment> findByDriverId(@Param("driverId") Long driverId);

    java.util.Optional<Payment> findByBooking_Id(Long bookingId);
}
