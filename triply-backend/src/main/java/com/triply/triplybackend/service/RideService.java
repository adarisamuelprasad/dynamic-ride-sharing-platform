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
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.triply.triplybackend.repository.VehicleRepository vehicleRepository;

    @Autowired
    private com.triply.triplybackend.repository.BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    public Ride postRide(Long driverId, RideRequest request) {

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

        ride.setSmokingAllowed(request.getSmokingAllowed());
        ride.setPetsAllowed(request.getPetsAllowed());
        ride.setInstantBooking(request.getInstantBooking());
        ride.setMaxTwoInBack(request.getMaxTwoInBack());

        double fare = request.getFarePerSeat();
        if (fare <= 0 && request.getSourceLat() != null && request.getSourceLng() != null
                && request.getDestLat() != null && request.getDestLng() != null) {
            double distanceKm = haversine(request.getSourceLat(), request.getSourceLng(), request.getDestLat(),
                    request.getDestLng());
            double basePerKm = 5.0; // simple base rate per km
            fare = Math.max(1.0, Math.round(distanceKm * basePerKm));
        }
        ride.setFarePerSeat(fare);
        ride.setDriver(driver);

        return rideRepository.save(ride);
    }

    public List<Ride> searchRide(String source, String destination, java.time.LocalDateTime date,
            Double minFare, Double maxFare, String vehicleModel) {
        List<Ride> base;
        if (date != null) {
            var start = date.toLocalDate().atStartOfDay();
            var end = start.plusDays(1);
            base = rideRepository.findBySourceIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeBetween(source,
                    destination, start, end);
        } else {
            base = rideRepository.findBySourceIgnoreCaseAndDestinationIgnoreCase(source, destination);
        }

        return base.stream()
                .filter(r -> r.getStatus() == null || "PLANNED".equalsIgnoreCase(r.getStatus()))
                .filter(r -> minFare == null || r.getFarePerSeat() >= minFare)
                .filter(r -> maxFare == null || r.getFarePerSeat() <= maxFare)
                .filter(r -> vehicleModel == null || r.getVehicleModel() != null
                        && r.getVehicleModel().toLowerCase().contains(vehicleModel.toLowerCase()))
                .toList();
    }

    public List<Ride> findAll() {
        return rideRepository.findAll();
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public List<Ride> getRidesByDriver(Long driverId) {
        return rideRepository.findByDriverId(driverId);
    }

    public Ride updateRide(Long rideId, Long driverId, RideRequest req) {
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

        if (req.getSmokingAllowed() != null)
            ride.setSmokingAllowed(req.getSmokingAllowed());
        if (req.getPetsAllowed() != null)
            ride.setPetsAllowed(req.getPetsAllowed());
        if (req.getInstantBooking() != null)
            ride.setInstantBooking(req.getInstantBooking());
        if (req.getMaxTwoInBack() != null)
            ride.setMaxTwoInBack(req.getMaxTwoInBack());

        if (req.getStatus() != null) {
            ride.setStatus(req.getStatus());
            if ("COMPLETED".equals(req.getStatus())) {
                List<com.triply.triplybackend.model.Booking> bookings = bookingRepository.findByRide_Id(ride.getId());
                for (com.triply.triplybackend.model.Booking b : bookings) {
                    if ("CONFIRMED".equals(b.getStatus())) {
                        b.setStatus("COMPLETED");
                        bookingRepository.save(b);

                        // Notify passenger (and send email)
                        notificationService.sendDetailedNotification(
                                b.getPassenger().getEmail(),
                                "RIDE_COMPLETED",
                                "Your ride from " + ride.getSource() + " to " + ride.getDestination()
                                        + " has been marked as completed. Please rate your driver!",
                                ride.getId(),
                                null);
                    }
                }
            }
        }

        return rideRepository.save(ride);
    }

    public void deleteRide(Long rideId, Long userId) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOwner = ride.getDriver().getId().equals(userId);
        boolean isAdmin = user.getRole() == com.triply.triplybackend.model.ERole.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Unauthorized");
        }
        rideRepository.delete(ride);
    }
}
