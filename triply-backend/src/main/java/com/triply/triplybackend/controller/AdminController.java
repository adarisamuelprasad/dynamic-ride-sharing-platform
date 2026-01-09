package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.User;
import com.triply.triplybackend.model.Ride;
import com.triply.triplybackend.model.Booking;
import com.triply.triplybackend.model.ERole;
import com.triply.triplybackend.model.Review;
import com.triply.triplybackend.payload.requests.AdminUpdateUserRequest;
import com.triply.triplybackend.repository.UserRepository;
import com.triply.triplybackend.repository.RideRepository;
import com.triply.triplybackend.repository.BookingRepository;
import com.triply.triplybackend.repository.ReviewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository users;

    @Autowired
    private RideRepository rides;

    @Autowired
    private BookingRepository bookings;

    @Autowired
    private ReviewRepository reviews;

    @GetMapping("/users")
    public Page<User> allUsers(Pageable pageable) {
        return users.findAll(pageable);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody AdminUpdateUserRequest body) {
        return users.findById(id)
                .map(u -> {
                    if (body.getName() != null)
                        u.setName(body.getName());
                    if (body.getPhone() != null)
                        u.setPhone(body.getPhone());
                    if (body.getBlocked() != null)
                        u.setBlocked(body.getBlocked());
                    if (body.getDriverVerified() != null)
                        u.setDriverVerified(body.getDriverVerified());
                    if (body.getVehicleModel() != null)
                        u.setVehicleModel(body.getVehicleModel());
                    if (body.getLicensePlate() != null)
                        u.setLicensePlate(body.getLicensePlate());
                    if (body.getCapacity() != null)
                        u.setCapacity(body.getCapacity());
                    if (body.getRole() != null) {
                        try {
                            u.setRole(ERole.valueOf(body.getRole()));
                        } catch (IllegalArgumentException ignored) {
                        }
                    }
                    users.save(u);
                    return ResponseEntity.ok(u);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!users.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        users.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id, @RequestParam boolean blocked) {
        return users.findById(id)
                .map(u -> {
                    u.setBlocked(blocked);
                    users.save(u);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/users/{id}/verify-driver")
    public ResponseEntity<?> verifyDriver(@PathVariable Long id) {
        return users.findById(id)
                .map(u -> {
                    u.setDriverVerified(true);
                    users.save(u);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/rides")
    public Page<Ride> allRides(Pageable pageable) {
        return rides.findAll(pageable);
    }

    @GetMapping("/bookings")
    public Page<Booking> allBookings(Pageable pageable) {
        return bookings.findAll(pageable);
    }

    @GetMapping("/rude-activity")
    public Page<Review> rudeActivity(Pageable pageable) {
        // Fetch reviews with rating < 3 as "rude" behavior indicator
        return reviews.findByRatingLessThan(3, pageable);
    }

    @GetMapping("/payments")
    public List<Map<String, Object>> payments() {
        // Payments are not modeled yet; return empty list for now
        return Collections.emptyList();
    }
}
