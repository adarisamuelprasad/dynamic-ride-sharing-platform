package com.triply.triplybackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String userEmail, String type, String message, Object data) {
        if (userEmail == null)
            return;

        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("message", message);
        payload.put("data", data);
        payload.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSendToUser(userEmail, "/queue/notifications", payload);
    }

    public void broadcastRideUpdate(Long rideId, String type, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", type);
        payload.put("message", message);
        payload.put("rideId", rideId);

        messagingTemplate.convertAndSend("/topic/ride/" + rideId, payload);
    }
}
