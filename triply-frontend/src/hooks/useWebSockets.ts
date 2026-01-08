import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

export const useWebSockets = () => {
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!authService.isLoggedIn()) return;

        const user = authService.currentUser;
        if (!user) return;

        let client: Client | null = null;
        try {
            const socket = new SockJS('http://localhost:8082/ws');
            client = new Client({
                webSocketFactory: () => socket,
                onConnect: () => {
                    console.log('Connected to WebSocket');

                    client?.subscribe(`/user/${user.email}/queue/notifications`, (message) => {
                        try {
                            const notification = JSON.parse(message.body);
                            toast(notification.message || 'New update!', {
                                description: notification.type?.replace('_', ' ') || 'Notification',
                            });
                        } catch (e) {
                            console.error('Error parsing notification:', e);
                        }
                    });
                },
                onStompError: (frame) => {
                    console.error('Stomp error:', frame.headers['message']);
                },
                onWebSocketError: (event) => {
                    console.error('WebSocket error:', event);
                },
            });

            client.activate();
            stompClientRef.current = client;
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    return stompClientRef.current;
};
