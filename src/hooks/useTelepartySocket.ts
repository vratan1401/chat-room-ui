// src/hooks/useTelepartySocket.ts
import { useEffect, useRef, useState } from 'react';
import {
    TelepartyClient,
    SocketEventHandler,
    SocketMessageTypes,
    SessionChatMessage,
    SendMessageData,
} from 'teleparty-WebSocket-lib';

export function useTelepartySocket(nickname: string) {
    const [messages, setMessages] = useState<SessionChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<TelepartyClient | null>(null);

    useEffect(() => {
        const handler: SocketEventHandler = {
            onConnectionReady: () => {
                console.log('Socket connected');
                setIsConnected(true);
            },
            onClose: () => {
                alert('Socket closed. Please refresh to reconnect.');
                setIsConnected(false);
            },
            onMessage: (message) => {
                console.log('Received message:', message);
                if (message.type === SocketMessageTypes.SEND_MESSAGE) {
                    setMessages((prev) => [...prev, message.data]);
                }
            },
        };

        clientRef.current = new TelepartyClient(handler);

        return () => {
            clientRef.current?.close();
        };
    }, []);

    const createRoom = async () => {
        if (!clientRef.current) return null;
        const roomId = await clientRef.current.createChatRoom(nickname);
        return roomId;
    };

    const joinRoom = (roomId: string) => {
        clientRef.current?.joinChatRoom(nickname, roomId);
    };

    const sendMessage = (text: string) => {
        const payload: SendMessageData = { body: text };
        clientRef.current?.sendMessage(SocketMessageTypes.SEND_MESSAGE, payload);
    };

    return {
        isConnected,
        messages,
        createRoom,
        joinRoom,
        sendMessage,
    };
}
