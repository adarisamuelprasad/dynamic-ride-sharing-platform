package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.Booking;
import com.triply.triplybackend.model.User;
import com.triply.triplybackend.model.Payment;
import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.repository.BookingRepository;
import com.triply.triplybackend.repository.RideRepository;
import com.triply.triplybackend.repository.UserRepository;
import com.triply.triplybackend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/book")
    public ResponseEntity<?> bookRide(@RequestBody Booking bookingRequest, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = (String) auth.getPrincipal();
        var passengerOpt = userRepository.findByEmail(email);
        if (passengerOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        Long passengerId = passengerOpt.get().getId();

        var rideOpt = rideRepository.findById(bookingRequest.getRideId());
        if (rideOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Ride not found");
        }
        var ride = rideOpt.get();

        // Check if passenger already booked this ride
        var existingBooking = bookingRepository.findByPassengerIdAndRideId(passengerId, ride.getId());
        if (existingBooking.isPresent() && !"CANCELLED".equals(existingBooking.get().getStatus())) {
            return ResponseEntity.badRequest().body("You have already booked this ride");
        }

        if (ride.getAvailableSeats() < bookingRequest.getSeatsBooked()) {
            return ResponseEntity.badRequest().body("Not enough seats available");
        }

        // reduce seats
        ride.setAvailableSeats(ride.getAvailableSeats() - bookingRequest.getSeatsBooked());
        rideRepository.save(ride);

        // save booking
        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setPassenger(passengerOpt.get());
        booking.setSeatsBooked(bookingRequest.getSeatsBooked());
        booking.setStatus("CONFIRMED");

        bookingRepository.save(booking);

        // Calculate proportional fare for multiple passengers
        // Fare per seat is already calculated dynamically using: Base Fare + (Rate per Km × Distance)
        // For multiple seats, the cost is proportional: Total Fare = Number of Seats × Fare Per Seat
        // This ensures fair cost splitting where each passenger pays the same amount per seat
        double totalFare = booking.getSeatsBooked() * ride.getFarePerSeat();
        
        // simulate payment capture
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(totalFare);
        payment.setStatus("PAID");
        paymentRepository.save(payment);

        return ResponseEntity.ok(booking);
    }

    @GetMapping("/my")
    public ResponseEntity<?> myBookings(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String email = (String) auth.getPrincipal();
        var passengerOpt = userRepository.findByEmail(email);
        if (passengerOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        Long passengerId = passengerOpt.get().getId();
        return ResponseEntity.ok(bookingRepository.findByPassengerId(passengerId));
    }

    @PostMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String email = (String) auth.getPrincipal();
        var passengerOpt = userRepository.findByEmail(email);
        if (passengerOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }
        Long passengerId = passengerOpt.get().getId();

        var bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Booking not found");
        }

        Booking booking = bookingOpt.get();

        // Verify that the booking belongs to the authenticated user
        if (!booking.getPassenger().getId().equals(passengerId)) {
            return ResponseEntity.status(403).body("You can only cancel your own bookings");
        }

        // Check if already cancelled
        if ("CANCELLED".equals(booking.getStatus())) {
            return ResponseEntity.badRequest().body("Booking is already cancelled");
        }

        // Update booking status
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);

        // Restore seats to the ride
        Ride ride = booking.getRide();
        ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
        rideRepository.save(ride);

        // Update payment status if exists
        var paymentOpt = paymentRepository.findByBookingId(bookingId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus("REFUNDED");
            paymentRepository.save(payment);
        }

        return ResponseEntity.ok(booking);
    }
}
