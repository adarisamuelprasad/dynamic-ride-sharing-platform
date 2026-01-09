import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export const useWebSockets = () => {
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!authService.isLoggedIn()) return;

        const user = authService.currentUser;
        if (!user) return;

        let client = null;
        try {
            const socket = new SockJS('http);
            client = new Client({
                webSocketFactory) => socket, onConnect) => {
                    console.log('Connected to WebSocket');

                    client?.subscribe(`/user/${user.email}/queue/notifications`, (message) => {
                        try {
                            const notification = JSON.parse(message.body);
                            toast(notification.message || 'New update!', {
                                description, ' ') || 'Notification',
                            });
                        } catch (e) {
                            console.error("Error parsing notification", e);
                        }
                    });
                }, onStompError) => {
                    console.error('Stomp error, frame.headers['message']);
                }, onWebSocketError) => {
                    console.error("WebSocket error", event);
                },
            });

            client.activate();
            stompClientRef.current = client;
        } catch (error) {
            console.error("Failed to initialize WebSocket", error);
        }

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    return stompClientRef.current;
};
