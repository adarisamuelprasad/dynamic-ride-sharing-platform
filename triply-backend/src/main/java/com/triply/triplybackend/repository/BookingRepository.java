package com.triply.triplybackend.repository;

import com.triply.triplybackend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerId(Long passengerId);

    // Check if passenger already has a booking for this ride
    java.util.Optional<Booking> findByPassengerIdAndRide_Id(Long passengerId, Long rideId);

    // Find bookings by ride ID
    List<Booking> findByRide_Id(Long rideId);
}
