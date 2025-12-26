package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.payload.requests.RideRequest;
import com.triply.triplybackend.security.JwtUtil;
import com.triply.triplybackend.service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/rides")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:8080" }, allowCredentials = "true")
@SuppressWarnings("null")
public class RideController {

    @Autowired
    private RideService rideService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/post")
    public ResponseEntity<?> postRide(@RequestBody RideRequest request, HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Long driverId = jwtUtil.getClaims(token).get("uid", Long.class);

        Ride ride = rideService.postRide(driverId, request);
        return ResponseEntity.ok(ride);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchRide(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) Double minFare,
            @RequestParam(required = false) Double maxFare,
            @RequestParam(required = false) String vehicleModel) {
        java.time.LocalDateTime dateParam = null;
        if (date != null && !date.isBlank()) {
            // Expect ISO date like 2025-12-02
            dateParam = java.time.LocalDate.parse(date).atStartOfDay();
        }
        List<Ride> rides = rideService.searchRide(source, destination, dateParam, minFare, maxFare, vehicleModel);
        return ResponseEntity.ok(rides);
    }

    @GetMapping
    public ResponseEntity<?> allRides() {
        return ResponseEntity.ok(rideService.findAll());
    }

    @GetMapping("/my-rides")
    public ResponseEntity<?> getMyRides(HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Long driverId = jwtUtil.getClaims(token).get("uid", Long.class);

        return ResponseEntity.ok(rideService.getRidesByDriver(driverId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRide(@PathVariable Long id, @RequestBody RideRequest request,
            HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Long driverId = jwtUtil.getClaims(token).get("uid", Long.class);

        try {
            Ride updated = rideService.updateRide(id, driverId, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelRide(@PathVariable Long id, HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Long driverId = jwtUtil.getClaims(token).get("uid", Long.class);

        try {
            rideService.cancelRide(id, driverId);
            return ResponseEntity.ok("Ride cancelled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @PostMapping("/complete/{id}")
    public ResponseEntity<?> completeRide(@PathVariable Long id, HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }
        Long driverId = jwtUtil.getClaims(token).get("uid", Long.class);

        try {
            rideService.completeRide(id, driverId);
            return ResponseEntity.ok("Ride marked as completed and funds transferred to wallet");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/estimate-fare")
    public ResponseEntity<?> estimateFare(@RequestParam String source, @RequestParam String destination) {
        if (source == null || source.isBlank() || destination == null || destination.isBlank()) {
            return ResponseEntity.badRequest().body("Source and destination are required");
        }

        try {
            double[] srcCoords = rideService.getGoogleMapsService().getCoordinates(source);
            double[] destCoords = rideService.getGoogleMapsService().getCoordinates(destination);

            if (srcCoords == null || destCoords == null) {
                return ResponseEntity.badRequest().body("Could not find coordinates for locations");
            }

            double distanceKm = rideService.getGoogleMapsService().calculateDistance(
                    srcCoords[0], srcCoords[1], destCoords[0], destCoords[1]);

            double baseFare = rideService.getBaseFare();
            double ratePerKm = rideService.getRatePerKm();
            double calculatedFare = baseFare + (ratePerKm * distanceKm);
            calculatedFare = Math.max(1.0, Math.round(calculatedFare * 100.0) / 100.0);

            Map<String, Object> result = new HashMap<>();
            result.put("distanceKm", distanceKm);
            result.put("suggestedFare", calculatedFare);
            result.put("sourceLat", srcCoords[0]);
            result.put("sourceLng", srcCoords[1]);
            result.put("destLat", destCoords[0]);
            result.put("destLng", destCoords[1]);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error calculating estimate: " + e.getMessage());
        }
    }

    @GetMapping("/locations/autocomplete")
    public ResponseEntity<?> autocompleteLocations(@RequestParam String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(rideService.getGoogleMapsService().autocomplete(query));
    }
}
