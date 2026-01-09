package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.Booking;
import com.triply.triplybackend.model.User;
import com.triply.triplybackend.model.Payment;
import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.repository.BookingRepository;
import com.triply.triplybackend.repository.RideRepository;
import com.triply.triplybackend.repository.UserRepository;
import com.triply.triplybackend.repository.PaymentRepository;
import com.triply.triplybackend.service.GoogleMapsService;
import com.triply.triplybackend.service.NotificationService;
import com.triply.triplybackend.service.StripeService;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
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

    @Autowired
    private GoogleMapsService googleMapsService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private StripeService stripeService;

    @Autowired
    private com.triply.triplybackend.service.EmailService emailService;

    @Autowired
    private com.triply.triplybackend.service.TicketService ticketService;

    private final double baseFare = 50.0;
    private final double ratePerKm = 12.0;

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
        List<Booking> existingBookings = bookingRepository.findByPassengerIdAndRide_Id(passengerId, ride.getId());
        boolean hasActiveBooking = existingBookings.stream()
                .anyMatch(b -> !"CANCELLED".equals(b.getStatus()) && !"REJECTED".equals(b.getStatus()));

        if (hasActiveBooking) {
            return ResponseEntity.badRequest().body("You have already booked or requested this ride");
        }

        if (ride.getAvailableSeats() < bookingRequest.getSeatsBooked()) {
            return ResponseEntity.badRequest().body("Not enough seats available");
        }

        // reduce seats to hold them
        ride.setAvailableSeats(ride.getAvailableSeats() - bookingRequest.getSeatsBooked());
        rideRepository.save(ride);

        // save booking
        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setPassenger(passengerOpt.get());
        booking.setSeatsBooked(bookingRequest.getSeatsBooked());
        booking.setStatus("PENDING"); // Initial status is PENDING (waiting for driver approval)

        // Calculate fare
        double farePerSeat = ride.getFarePerSeat();
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
            double distKm = googleMapsService.calculateDistance(pLat, pLng, dLat, dLng);
            booking.setPickupLat(pLat);
            booking.setPickupLng(pLng);
            booking.setDropoffLat(dLat);
            booking.setDropoffLng(dLng);
            booking.setDistanceKm(distKm);
            double calculatedFare = baseFare + (ratePerKm * distKm);
            farePerSeat = Math.max(1.0, Math.round(calculatedFare * 100.0) / 100.0);
        } else {
            booking.setPickupLat(ride.getSourceLat());
            booking.setPickupLng(ride.getSourceLng());
            booking.setDropoffLat(ride.getDestLat());
            booking.setDropoffLng(ride.getDestLng());
            booking.setDistanceKm(ride.getDistanceKm());
        }

        booking.setFareAmount(farePerSeat * booking.getSeatsBooked());
        booking.setPaymentMethod(
                bookingRequest.getPaymentMethod() != null ? bookingRequest.getPaymentMethod() : "CASH");

        bookingRepository.save(booking);

        // Notify Driver of new request
        notificationService.sendNotification(
                booking.getRide().getDriver().getEmail(),
                "NEW_REQUEST",
                "New ride request from " + booking.getPassenger().getName() + ". Please review.",
                booking);

        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{id}/respond")
    public ResponseEntity<?> respondToBooking(@PathVariable Long id, @RequestParam String status, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        // Only Driver can respond
        String email = (String) auth.getPrincipal();
        var user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        var booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getRide().getDriver().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to manage this booking");
        }

        if ("APPROVED".equalsIgnoreCase(status)) {
            booking.setStatus("APPROVED"); // Approved, waiting for payment
            notificationService.sendNotification(
                    booking.getPassenger().getEmail(),
                    "REQUEST_APPROVED",
                    "Your ride request has been accepted! Please proceed to payment.",
                    booking);
        } else if ("REJECTED".equalsIgnoreCase(status)) {
            booking.setStatus("REJECTED");
            // Release seats
            Ride ride = booking.getRide();
            ride.setAvailableSeats(ride.getAvailableSeats() + booking.getSeatsBooked());
            rideRepository.save(ride);
            notificationService.sendNotification(
                    booking.getPassenger().getEmail(),
                    "REQUEST_REJECTED",
                    "Your ride request was declined by the driver.",
                    booking);
        } else {
            return ResponseEntity.badRequest().body("Invalid status");
        }

        bookingRepository.save(booking);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payForBooking(@PathVariable Long id, @RequestBody Map<String, String> payload,
            Authentication auth) {
        // Logic to process payment after approval
        var booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!"APPROVED".equals(booking.getStatus())) {
            return ResponseEntity.badRequest().body("Booking must be APPROVED to pay");
        }

        double totalFare = booking.getFareAmount();
        String paymentMethod = payload.getOrDefault("paymentMethod", "CASH");
        booking.setPaymentMethod(paymentMethod);

        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(totalFare);
        payment.setType("BOOKING_PAYMENT");

        if ("STRIPE".equalsIgnoreCase(paymentMethod)) {
            try {
                var stripeData = stripeService.createPaymentIntent(totalFare, "inr");
                payment.setStatus("PENDING");
                payment.setTransactionId(stripeData.get("id"));
                paymentRepository.save(payment);

                Map<String, Object> response = new HashMap<>();
                response.put("booking", booking);
                response.put("clientSecret", stripeData.get("clientSecret"));
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Stripe error: " + e.getMessage());
            }
        } else {
            // Cash
            payment.setStatus("UNPAID");
            payment.setTransactionId("CASH-" + System.currentTimeMillis());
            paymentRepository.save(payment);

            booking.setStatus("CONFIRMED"); // Auto confirm if cash
            bookingRepository.save(booking);

            sendBookingConfirmationEmail(booking);

            return ResponseEntity.ok(booking);
        }
    }

    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<?> confirmPayment(@PathVariable Long id, @RequestParam String paymentIntentId) {
        Booking booking = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));

        // Update payment status
        Payment payment = paymentRepository.findByBooking(booking).orElse(new Payment());
        payment.setBooking(booking);
        payment.setTransactionId(paymentIntentId);
        payment.setStatus("PAID");
        payment.setType("BOOKING_PAYMENT"); // likely already set but ensure
        paymentRepository.save(payment);

        booking.setStatus("CONFIRMED");
        booking.setPaymentStatus("PAID");
        bookingRepository.save(booking);

        sendBookingConfirmationEmail(booking);

        return ResponseEntity.ok(booking);
    }

    private void sendBookingConfirmationEmail(Booking booking) {
        try {
            byte[] pdf = ticketService.generateTicketPdf(booking);
            String subject = "TripLy Ticket - Ride Confirmed #" + booking.getId();
            String body = "<h3>Your ride is confirmed!</h3>" +
                    "<p>Thank you for booking with TripLy. Please find your ticket attached.</p>" +
                    "<p><b>Ride Details:</b></p>" +
                    "<ul>" +
                    "<li>From: " + booking.getRide().getSource() + "</li>" +
                    "<li>To: " + booking.getRide().getDestination() + "</li>" +
                    "<li>Driver: " + booking.getRide().getDriver().getName() + "</li>" +
                    "</ul>";

            emailService.sendTicketEmail(booking.getPassenger().getEmail(), subject, body, pdf);
        } catch (Exception e) {
            System.err.println("Failed to send ticket email: " + e.getMessage());
        }
    }

    @GetMapping("/driver-requests")
    public ResponseEntity<?> getDriverRequests(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String email = (String) auth.getPrincipal();
        var driver = userRepository.findByEmail(email).orElseThrow();

        // Find bookings for rides driven by this user
        List<Booking> requests = bookingRepository.findByRide_Driver_Id(driver.getId());
        return ResponseEntity.ok(requests);
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
}
