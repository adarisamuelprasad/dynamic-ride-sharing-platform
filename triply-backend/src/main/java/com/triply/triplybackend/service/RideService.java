package com.triply.triplybackend.service;

import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.model.User;
import com.triply.triplybackend.payload.requests.RideRequest;
import com.triply.triplybackend.repository.RideRepository;
import com.triply.triplybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.triply.triplybackend.repository.VehicleRepository vehicleRepository;

    @Autowired
    private GoogleMapsService googleMapsService;

    @Autowired
    private com.triply.triplybackend.repository.BookingRepository bookingRepository;

    @Autowired
    private com.triply.triplybackend.repository.PaymentRepository paymentRepository;

    @Autowired
    private NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Value("${fare.base:50.0}")
    private double baseFare;

    @org.springframework.beans.factory.annotation.Value("${fare.rate.per.km:8.0}")
    private double ratePerKm;

    public GoogleMapsService getGoogleMapsService() {
        return googleMapsService;
    }

    public double getBaseFare() {
        return baseFare;
    }

    public double getRatePerKm() {
        return ratePerKm;
    }

    public Ride postRide(@org.springframework.lang.NonNull Long driverId, RideRequest request) {

        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Ride ride = new Ride();
        ride.setSource(request.getSource());
        ride.setDestination(request.getDestination());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setSourceLat(request.getSourceLat());
        ride.setSourceLng(request.getSourceLng());
        ride.setDestLat(request.getDestLat());
        ride.setDestLng(request.getDestLng());

        // Automatic Geocoding if coordinates are missing
        if (ride.getSourceLat() == null && ride.getSource() != null && !ride.getSource().isBlank()) {
            double[] coords = googleMapsService.getCoordinates(ride.getSource());
            if (coords != null) {
                ride.setSourceLat(coords[0]);
                ride.setSourceLng(coords[1]);
            }
        }
        if (ride.getDestLat() == null && ride.getDestination() != null && !ride.getDestination().isBlank()) {
            double[] coords = googleMapsService.getCoordinates(ride.getDestination());
            if (coords != null) {
                ride.setDestLat(coords[0]);
                ride.setDestLng(coords[1]);
            }
        }

        if (request.getVehicleId() != null) {
            com.triply.triplybackend.model.Vehicle v = vehicleRepository.findById(request.getVehicleId()).orElse(null);
            if (v != null) {
                ride.setVehicleModel(v.getModel());
                ride.setVehiclePlate(v.getPlateNumber());
                ride.setVehicleImage(v.getImageUrl());
                ride.setAcAvailable(v.getAcAvailable());
                ride.setSunroofAvailable(v.getSunroofAvailable());
                if (v.getExtraImages() != null) {
                    ride.setExtraImages(new java.util.ArrayList<>(v.getExtraImages()));
                }
            } else {
                // Fallback
                ride.setVehicleModel(driver.getVehicleModel());
                ride.setVehiclePlate(driver.getLicensePlate());
            }
        } else {
            // Fallback
            ride.setVehicleModel(driver.getVehicleModel());
            ride.setVehiclePlate(driver.getLicensePlate());
        }

        // Distance and Fare Calculation
        double distanceKm = 0.0;
        if (ride.getSourceLat() != null && ride.getSourceLng() != null
                && ride.getDestLat() != null && ride.getDestLng() != null) {
            distanceKm = googleMapsService.calculateDistance(
                    ride.getSourceLat(), ride.getSourceLng(),
                    ride.getDestLat(), ride.getDestLng());
            ride.setDistanceKm(distanceKm);
        }

        double fare = request.getFarePerSeat();
        // If fare is 0 or less, calculate it automatically
        if (fare <= 0 && distanceKm > 0) {
            fare = baseFare + (ratePerKm * distanceKm);
            fare = Math.max(1.0, Math.round(fare * 100.0) / 100.0);
        }
        ride.setFarePerSeat(fare);
        ride.setDriver(driver);

        return rideRepository.save(ride);
    }

    public List<Ride> searchRide(String source, String destination, java.time.LocalDateTime date,
            Double minFare, Double maxFare, String vehicleModel) {

        final double RADIUS_KM = 5.0; // 5km radius for smart matching

        // First, get coordinates for source and destination query
        double[] qSrc = googleMapsService.getCoordinates(source);
        double[] qDest = googleMapsService.getCoordinates(destination);

        List<Ride> allRides = rideRepository.findAll();

        return allRides.stream()
                .filter(r -> "AVAILABLE".equalsIgnoreCase(r.getStatus()) || r.getStatus() == null)
                .filter(r -> {
                    if (date == null)
                        return true;
                    return r.getDepartureTime().toLocalDate().equals(date.toLocalDate());
                })
                .filter(r -> {
                    // Smart Matching logic
                    if (qSrc != null && qDest != null && r.getSourceLat() != null && r.getDestLat() != null) {
                        double distSrc = googleMapsService.calculateDistance(qSrc[0], qSrc[1], r.getSourceLat(),
                                r.getSourceLng());
                        double distDest = googleMapsService.calculateDistance(qDest[0], qDest[1], r.getDestLat(),
                                r.getDestLng());
                        return distSrc <= RADIUS_KM && distDest <= RADIUS_KM;
                    }
                    // Fallback to text matching
                    return r.getSource().toLowerCase().contains(source.toLowerCase())
                            && r.getDestination().toLowerCase().contains(destination.toLowerCase());
                })
                .filter(r -> minFare == null || r.getFarePerSeat() >= minFare)
                .filter(r -> maxFare == null || r.getFarePerSeat() <= maxFare)
                .filter(r -> vehicleModel == null || r.getVehicleModel() != null
                        && r.getVehicleModel().toLowerCase().contains(vehicleModel.toLowerCase()))
                .toList();
    }

    public List<Ride> findAll() {
        return rideRepository.findAll();
    }

    // Haversine method removed - now using GoogleMapsService

    public List<Ride> getRidesByDriver(@org.springframework.lang.NonNull Long driverId) {
        return rideRepository.findByDriverId(driverId);
    }

    public Ride updateRide(@org.springframework.lang.NonNull Long rideId,
            @org.springframework.lang.NonNull Long driverId, RideRequest req) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Update basic fields if provided
        if (req.getSource() != null)
            ride.setSource(req.getSource());
        if (req.getDestination() != null)
            ride.setDestination(req.getDestination());
        if (req.getAvailableSeats() != 0)
            ride.setAvailableSeats(req.getAvailableSeats());
        if (req.getFarePerSeat() != 0)
            ride.setFarePerSeat(req.getFarePerSeat());

        // Update vehicle details if provided (this is the key requirement)
        if (req.getModel() != null)
            ride.setVehicleModel(req.getModel());
        if (req.getPlateNumber() != null)
            ride.setVehiclePlate(req.getPlateNumber());
        if (req.getImageUrl() != null)
            ride.setVehicleImage(req.getImageUrl());
        if (req.getExtraImages() != null)
            ride.setExtraImages(req.getExtraImages());

        // Also update boolean flags if they are part of "details"
        if (req.getAcAvailable() != null)
            ride.setAcAvailable(req.getAcAvailable());
        if (req.getSunroofAvailable() != null)
            ride.setSunroofAvailable(req.getSunroofAvailable());

        return rideRepository.save(ride);
    }

    public void cancelRide(@org.springframework.lang.NonNull Long rideId,
            @org.springframework.lang.NonNull Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own rides");
        }

        // Cancel all bookings for this ride
        List<com.triply.triplybackend.model.Booking> bookings = bookingRepository.findByRide_Id(rideId);
        for (com.triply.triplybackend.model.Booking booking : bookings) {
            if (!"CANCELLED".equals(booking.getStatus())) {
                booking.setStatus("CANCELLED");
                bookingRepository.save(booking);

                // Refund payment if exists
                var paymentOpt = paymentRepository.findByBooking_Id(booking.getId());
                if (paymentOpt.isPresent()) {
                    com.triply.triplybackend.model.Payment payment = paymentOpt.get();
                    payment.setStatus("REFUNDED");
                    paymentRepository.save(payment);
                }

                // Notify Passenger
                notificationService.sendNotification(
                        booking.getPassenger().getEmail(),
                        "RIDE_CANCELLED",
                        "A ride you booked from " + ride.getSource() + " to " + ride.getDestination()
                                + " has been cancelled by the driver.",
                        ride.getId());
            }
        }

        // Delete the ride
        rideRepository.delete(ride);
    }

    @org.springframework.transaction.annotation.Transactional
    public void completeRide(@org.springframework.lang.NonNull Long rideId,
            @org.springframework.lang.NonNull Long driverId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (!ride.getDriver().getId().equals(driverId)) {
            throw new RuntimeException("Unauthorized: You can only complete your own rides");
        }

        if ("COMPLETED".equals(ride.getStatus())) {
            throw new RuntimeException("Ride is already completed");
        }

        ride.setStatus("COMPLETED");
        rideRepository.save(ride);

        // Process payments for all confirmed bookings
        List<com.triply.triplybackend.model.Booking> bookings = bookingRepository.findByRide_Id(rideId);
        double totalEarnings = 0;

        for (com.triply.triplybackend.model.Booking booking : bookings) {
            if ("CONFIRMED".equals(booking.getStatus())) {
                booking.setStatus("COMPLETED");
                bookingRepository.save(booking);

                Double amount = booking.getFareAmount();
                if (amount == null)
                    amount = 0.0;

                totalEarnings += amount;

                // Create a payment record for the transfer to driver
                com.triply.triplybackend.model.Payment transfer = new com.triply.triplybackend.model.Payment();
                transfer.setBooking(booking);
                transfer.setAmount(amount);
                transfer.setStatus("TRANSFERRED");
                transfer.setType("WALLET_RELEASE");
                transfer.setTransactionId("WLT-" + System.currentTimeMillis() + "-" + booking.getId());
                paymentRepository.save(transfer);
            }
        }

        // Credit driver's wallet
        User driver = ride.getDriver();
        driver.setWalletBalance((driver.getWalletBalance() != null ? driver.getWalletBalance() : 0.0) + totalEarnings);
        userRepository.save(driver);
    }
}
