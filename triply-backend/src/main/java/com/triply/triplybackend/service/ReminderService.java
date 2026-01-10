package com.triply.triplybackend.service;

import com.triply.triplybackend.model.Booking;
import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.repository.BookingRepository;
import com.triply.triplybackend.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReminderService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    // Run every hour
    @Scheduled(cron = "0 0 * * * *")
    public void sendRideReminders() {
        LocalDateTime now = LocalDateTime.now();

        // 24 Hours Reminder (check for rides in 24-25h window)
        processReminders(now.plusHours(24), now.plusHours(25), "24 hours");

        // 48 Hours Reminder (check for rides in 48-49h window)
        processReminders(now.plusHours(48), now.plusHours(49), "2 days");
    }

    private void processReminders(LocalDateTime start, LocalDateTime end, String timeLabel) {
        List<Ride> rides = rideRepository.findByDepartureTimeBetween(start, end);

        for (Ride ride : rides) {
            // Notify Driver
            String driverMsg = "Reminder: Your ride from " + ride.getSource() + " to " + ride.getDestination()
                    + " is in " + timeLabel + ".";
            Map<String, Object> details = new HashMap<>();
            details.put("rideId", ride.getId());
            details.put("source", ride.getSource());
            details.put("destination", ride.getDestination());
            details.put("time", ride.getDepartureTime().toString());

            notificationService.sendDetailedNotification(
                    ride.getDriver().getEmail(),
                    "RIDE_REMINDER",
                    driverMsg,
                    ride.getId(),
                    details);

            // Notify Passengers
            List<Booking> bookings = bookingRepository.findByRide_Id(ride.getId());
            for (Booking booking : bookings) {
                if ("CONFIRMED".equals(booking.getStatus())) {
                    String passengerMsg = "Reminder: Your ride with " + ride.getDriver().getName() + " is in "
                            + timeLabel + ".";
                    notificationService.sendDetailedNotification(
                            booking.getPassenger().getEmail(),
                            "RIDE_REMINDER",
                            passengerMsg,
                            ride.getId(),
                            details);
                }
            }
        }
    }
}
