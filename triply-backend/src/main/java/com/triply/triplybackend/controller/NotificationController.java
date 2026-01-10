package com.triply.triplybackend.controller;

import com.triply.triplybackend.model.Notification;
import com.triply.triplybackend.model.User;
import com.triply.triplybackend.repository.NotificationRepository;
import com.triply.triplybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserNotifications(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String email = (String) auth.getPrincipal();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String email = (String) auth.getPrincipal();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        @SuppressWarnings("null")
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Not authorized");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok(notification);
    }
}
