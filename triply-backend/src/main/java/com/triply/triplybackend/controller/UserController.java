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
}
