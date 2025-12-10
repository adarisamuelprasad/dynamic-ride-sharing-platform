package com.triply.triplybackend.repository;

import com.triply.triplybackend.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface RideRepository extends JpaRepository<Ride, Long> {

    List<Ride> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);

    List<Ride> findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeBetween(
            String source, String destination, LocalDateTime start, LocalDateTime end);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT r.source FROM Ride r")
    List<String> findDistinctSources();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT r.destination FROM Ride r")
    List<String> findDistinctDestinations();

    List<Ride> findByDriverId(Long driverId);
}
