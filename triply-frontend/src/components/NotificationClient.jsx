import React, { useEffect } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { toast } from "sonner";
import { authService } from "@/services/authService";

const NotificationClient = () => {
    useEffect(() => {
        if (!authService.isLoggedIn()) return;

        const currentUser = authService.currentUser;
        if (!currentUser) return;

        // Create socket connection
        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = Stomp.over(socket);

        // Disable debug logs to keep console clean
        stompClient.debug = () => { };

        const onConnect = () => {
            // Subscribe to user specific notifications
            // Spring sends to /user/queue/notifications -> translated to /user/{username}/queue/notifications internally
            stompClient.subscribe('/user/queue/notifications', (payload) => {
                try {
                    const notification = JSON.parse(payload.body);

                    // Display toast based on type
                    switch (notification.type) {
                        case 'NEW_REQUEST':
                            toast.info(`New Request: ${notification.message}`, {
                                action: {
                                    label: "View",
                                    onClick: () => window.location.href = "/driver-requests"
                                }
                            });
                            break;
                        case 'REQUEST_APPROVED':
                            toast.success(`Approved: ${notification.message}`, {
                                action: {
                                    label: "Pay Now",
                                    onClick: () => window.location.href = "/my-bookings"
                                }
                            });
                            break;
                        case 'REQUEST_REJECTED':
                            toast.error(`Declined: ${notification.message}`);
                            break;
                        default:
                            toast(notification.message);
                    }
                } catch (e) {
                    console.error("Failed to parse notification", e);
                }
            });
        };

        const onError = (err) => {
            console.error("WebSocket connection error", err);
        };

        // Attempt connection
        // Note: If using JWT, might need to pass headers: { 'Authorization': `Bearer ${token}` }
        // But SockJS doesn't support headers in handshake standardly without hacks. 
        // Triply backend might rely on session or open connection for now.
        stompClient.connect({}, onConnect, onError);

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
    }, []);

    return null; // This component doesn't render anything visual itself
};

export default NotificationClient;
