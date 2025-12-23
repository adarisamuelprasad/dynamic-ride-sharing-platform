package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.Booking;
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
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/bookings")
@SuppressWarnings("null")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private com.triply.triplybackend.service.GoogleMapsService googleMapsService;

    @Autowired
    private com.triply.triplybackend.service.StripeService stripeService;

    @Autowired
    private com.triply.triplybackend.service.NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Value("${fare.base:50.0}")
    private double baseFare;

    @org.springframework.beans.factory.annotation.Value("${fare.rate.per.km:8.0}")
    private double ratePerKm;

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
        var existingBooking = bookingRepository.findByPassengerIdAndRide_Id(passengerId, ride.getId());
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
        // If specific pickup/dropoff locations are provided, calculate exact distance
        double farePerSeat = ride.getFarePerSeat(); // Default from Ride

        Double pLat = (bookingRequest.getPickupLat() != null && bookingRequest.getPickupLat() != 0)
                ? bookingRequest.getPickupLat()
                : ride.getSourceLat();
        Double pLng = (bookingRequest.getPickupLng() != null && bookingRequest.getPickupLng() != 0)
                ? bookingRequest.getPickupLng()
                : ride.getSourceLng();
        Double dLat = (bookingRequest.getDropoffLat() != null && bookingRequest.getDropoffLat() != 0)
                ? bookingRequest.getDropoffLat()
                : ride.getDestLat();
        Double dLng = (bookingRequest.getDropoffLng() != null && bookingRequest.getDropoffLng() != 0)
                ? bookingRequest.getDropoffLng()
                : ride.getDestLng();

        if (pLat != null && pLng != null && dLat != null && dLng != null) {
            // Calculate specific distance
            double distKm = googleMapsService.calculateDistance(pLat, pLng, dLat, dLng);

            booking.setPickupLat(pLat);
            booking.setPickupLng(pLng);
            booking.setDropoffLat(dLat);
            booking.setDropoffLng(dLng);
            booking.setDistanceKm(distKm);

            // Re-calculate fare for THIS specific booking distance if different from ride's
            // total distance
            // Base Fare + (Rate per Km * Distance)
            double calculatedFare = baseFare + (ratePerKm * distKm);
            farePerSeat = Math.max(1.0, Math.round(calculatedFare * 100.0) / 100.0);
        } else {
            // Use ride's default coordinates for the booking record
            booking.setPickupLat(ride.getSourceLat());
            booking.setPickupLng(ride.getSourceLng());
            booking.setDropoffLat(ride.getDestLat());
            booking.setDropoffLng(ride.getDestLng());
            booking.setDistanceKm(ride.getDistanceKm());
        }

        booking.setFareAmount(farePerSeat * booking.getSeatsBooked());
        double totalFare = booking.getFareAmount();
        booking.setPaymentMethod(
                bookingRequest.getPaymentMethod() != null ? bookingRequest.getPaymentMethod() : "CASH");

        bookingRepository.save(booking);

        // Handle Payment based on method
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(totalFare);
        payment.setType("BOOKING_PAYMENT");
        payment.setTransactionId("TXN-" + System.currentTimeMillis() + "-" + booking.getId());

        if ("STRIPE".equalsIgnoreCase(booking.getPaymentMethod())) {
            try {
                var stripeData = stripeService.createPaymentIntent(totalFare, "inr");
                payment.setStatus("PENDING");
                payment.setTransactionId(stripeData.get("id"));
                paymentRepository.save(payment);

                // Return client secret to frontend
                Map<String, Object> response = new HashMap<>();
                response.put("booking", booking);
                response.put("clientSecret", stripeData.get("clientSecret"));

                // Notify Driver
                notificationService.sendNotification(
                        booking.getRide().getDriver().getEmail(),
                        "NEW_BOOKING",
                        "New Stripe booking from " + booking.getPassenger().getName() + " for ride to "
                                + booking.getRide().getDestination(),
                        booking);

                return ResponseEntity.ok(response);
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Stripe error: " + e.getMessage());
            }
        } else if ("CASH".equalsIgnoreCase(booking.getPaymentMethod())) {
            payment.setStatus("UNPAID"); // Will be paid at the end of ride? 或者 mark as PAID if user pays immediately?
            // Carpool often uses Cash on delivery (at the end of trip)
            paymentRepository.save(payment);
        } else {
            // Default simulated PAID for others
            payment.setStatus("PAID");
            paymentRepository.save(payment);
        }

        // Notify Driver for non-stripe bookings
        if (!"STRIPE".equalsIgnoreCase(booking.getPaymentMethod())) {
            notificationService.sendNotification(
                    booking.getRide().getDriver().getEmail(),
                    "NEW_BOOKING",
                    "New " + booking.getPaymentMethod() + " booking from " + booking.getPassenger().getName()
                            + " for ride to " + booking.getRide().getDestination(),
                    booking);
        }

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
        var paymentOpt = paymentRepository.findByBooking_Id(bookingId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus("REFUNDED");
            paymentRepository.save(payment);
        }

        // Notify Driver of cancellation
        notificationService.sendNotification(
                booking.getRide().getDriver().getEmail(),
                "BOOKING_CANCELLED",
                "A passenger (" + booking.getPassenger().getName() + ") has cancelled their booking for your ride to "
                        + booking.getRide().getDestination(),
                booking.getId());

        return ResponseEntity.ok(booking);
    }
}
