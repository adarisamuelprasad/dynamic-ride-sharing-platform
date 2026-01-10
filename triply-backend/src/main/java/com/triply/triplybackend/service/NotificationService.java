package com.triply.triplybackend.service;

import com.triply.triplybackend.model.Notification;
import com.triply.triplybackend.model.User;
import com.triply.triplybackend.repository.NotificationRepository;
import com.triply.triplybackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.triply.triplybackend.service.EmailService emailService;

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public void sendNotification(String userEmail, String type, String message, Object data) {
        sendDetailedNotification(userEmail, type, message, null, data);
    }

    public void sendDetailedNotification(String userEmail, String type, String message, Long relatedId,
            Object dataDetails) {
        if (userEmail == null)
            return;

        String additionalDataJson = null;
        if (dataDetails != null) {
            try {
                additionalDataJson = objectMapper.writeValueAsString(dataDetails);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // Persist notification
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        if (userOpt.isPresent()) {
            Notification notification = new Notification(userOpt.get(), type, message);
            notification.setRelatedId(relatedId);
            notification.setAdditionalData(additionalDataJson);
            notificationRepository.save(notification);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("message", message);
        payload.put("relatedId", relatedId);
        payload.put("data", dataDetails);
        payload.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSendToUser(userEmail, "/queue/notifications", payload);

        // Send Email
        try {
            emailService.sendEmail(userEmail, "Triply Notification: " + type, message);
        } catch (Exception e) {
            System.err.println("Failed to send email notif: " + e.getMessage());
        }
    }

    public void broadcastRideUpdate(Long rideId, String type, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("message", message);
        payload.put("rideId", rideId);
        payload.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/ride/" + rideId, payload);
    }
}
