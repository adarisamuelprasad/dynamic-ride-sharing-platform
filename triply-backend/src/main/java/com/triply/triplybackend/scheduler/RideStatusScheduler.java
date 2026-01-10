package com.triply.triplybackend.scheduler;

import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class RideStatusScheduler {

    @Autowired
    private RideRepository rideRepository;

    // Run every minute (60000 ms)
    @Scheduled(fixedRate = 60000)
    public void markPastRidesAsCompleted() {
        LocalDateTime now = LocalDateTime.now();
        List<Ride> pastRides = rideRepository.findByDepartureTimeBefore(now);

        if (!pastRides.isEmpty()) {
            int updatedCount = 0;
            for (Ride ride : pastRides) {
                if (ride.getStatus() == null || "PLANNED".equalsIgnoreCase(ride.getStatus())) {
                    ride.setStatus("COMPLETED");
                    updatedCount++;
                }
            }
            if (updatedCount > 0) {
                rideRepository.saveAll(pastRides);
                System.out.println("Marked " + updatedCount + " rides as COMPLETED.");
            }
        }
    }
}
