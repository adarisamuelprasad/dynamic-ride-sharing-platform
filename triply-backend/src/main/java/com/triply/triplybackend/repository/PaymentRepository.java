package com.triply.triplybackend.repository;

import com.triply.triplybackend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Find payments where the associated booking's passenger has the given ID
    java.util.List<Payment> findByBooking_Passenger_Id(Long passengerId);

    // Find payments where the associated booking's ride's driver has the given ID
    java.util.List<Payment> findByBooking_Ride_Driver_Id(Long driverId);
}
