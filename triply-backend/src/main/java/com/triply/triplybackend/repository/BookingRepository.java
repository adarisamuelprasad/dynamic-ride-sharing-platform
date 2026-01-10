package com.triply.triplybackend.repository;

import com.triply.triplybackend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerId(Long passengerId);

    List<Booking> findByPassengerIdAndRide_Id(Long passengerId, Long rideId);

    List<Booking> findByRide_Driver_Id(Long driverId);

    List<Booking> findByRide_Id(Long rideId);
}
