package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.User;
import com.triply.triplybackend.payload.requests.UpdatePasswordRequest;
import com.triply.triplybackend.repository.UserRepository;
import com.triply.triplybackend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordRequest req, HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token)) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        Long userId = jwtUtil.getClaims(token).get("uid", Long.class);
        if (userId == null) {
            return ResponseEntity.status(401).body("Invalid token payload");
        }

        Optional<User> uOpt = repo.findById(userId);
        if (uOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = uOpt.get();

        if (!encoder.matches(req.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect old password");
        }

        user.setPassword(encoder.encode(req.getNewPassword()));
        repo.save(user);

        return ResponseEntity.ok("Password updated successfully");
    }

    @Autowired
    private com.triply.triplybackend.repository.VehicleRepository vehicleRepo;

    private User getUserFromToken(HttpServletRequest httpReq) {
        String authHeader = httpReq.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            return null;
        String token = authHeader.substring(7);
        if (!jwtUtil.validate(token))
            return null;
        Long userId = jwtUtil.getClaims(token).get("uid", Long.class);
        return repo.findById(userId).orElse(null);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody com.triply.triplybackend.payload.requests.UpdateProfileRequest req,
            HttpServletRequest httpReq) {
        User user = getUserFromToken(httpReq);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        if (req.getName() != null && !req.getName().isEmpty())
            user.setName(req.getName());
        if (req.getPhone() != null && !req.getPhone().isEmpty())
            user.setPhone(req.getPhone());

        repo.save(user);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @GetMapping("/vehicles")
    public ResponseEntity<?> getVehicles(HttpServletRequest httpReq) {
        User user = getUserFromToken(httpReq);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        return ResponseEntity.ok(vehicleRepo.findByUserId(user.getId()));
    }

    @PostMapping("/vehicles")
    public ResponseEntity<?> addVehicle(@RequestBody com.triply.triplybackend.payload.requests.VehicleRequest req,
            HttpServletRequest httpReq) {
        User user = getUserFromToken(httpReq);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        com.triply.triplybackend.model.Vehicle v = new com.triply.triplybackend.model.Vehicle();
        v.setModel(req.getModel());
        v.setPlateNumber(req.getPlateNumber());
        v.setCapacity(req.getCapacity());
        v.setAcAvailable(req.getAcAvailable() != null ? req.getAcAvailable() : false);
        v.setSunroofAvailable(req.getSunroofAvailable() != null ? req.getSunroofAvailable() : false);
        v.setImageUrl(req.getImageUrl());
        if (req.getExtraImages() != null) {
            v.setExtraImages(req.getExtraImages());
        }
        v.setUser(user);

        vehicleRepo.save(v);
        return ResponseEntity.ok("Vehicle added successfully");
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id, HttpServletRequest httpReq) {
        User user = getUserFromToken(httpReq);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Optional<com.triply.triplybackend.model.Vehicle> vOpt = vehicleRepo.findById(id);
        if (vOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Vehicle not found");
        }

        com.triply.triplybackend.model.Vehicle v = vOpt.get();
        if (!v.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to delete this vehicle");
        }

        vehicleRepo.delete(v);
        return ResponseEntity.ok("Vehicle deleted successfully");
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id,
            @RequestBody com.triply.triplybackend.payload.requests.VehicleRequest req, HttpServletRequest httpReq) {
        User user = getUserFromToken(httpReq);
        if (user == null)
            return ResponseEntity.status(401).body("Unauthorized");

        Optional<com.triply.triplybackend.model.Vehicle> vOpt = vehicleRepo.findById(id);
        if (vOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Vehicle not found");
        }

        com.triply.triplybackend.model.Vehicle v = vOpt.get();
        if (!v.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized to update this vehicle");
        }

        v.setModel(req.getModel());
        v.setPlateNumber(req.getPlateNumber());
        v.setCapacity(req.getCapacity());
        v.setAcAvailable(req.getAcAvailable() != null ? req.getAcAvailable() : false);
        v.setSunroofAvailable(req.getSunroofAvailable() != null ? req.getSunroofAvailable() : false);
        v.setImageUrl(req.getImageUrl());

        if (req.getExtraImages() != null) {
            v.setExtraImages(req.getExtraImages());
        }

        vehicleRepo.save(v);
        return ResponseEntity.ok("Vehicle updated successfully");
    }
}
