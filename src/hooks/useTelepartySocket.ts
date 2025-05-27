import { useEffect, useRef, useState } from 'react';
import {
    TelepartyClient,
    SocketEventHandler,
    SocketMessageTypes,
    SessionChatMessage
} from 'teleparty-websocket-lib';


export const useTelepartySocket = () => {
    const [messages, setMessages] = useState<SessionChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<TelepartyClient | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);

    useEffect(() => {
        const eventHandler: SocketEventHandler = {
            onConnectionReady: () => {
                console.log('✅ WebSocket connection established.');
                setIsConnected(true);
            },
            onClose: () => {
                console.warn('⚠️ WebSocket closed.');
                alert('Connection closed. Please refresh to reconnect.');
                setIsConnected(false);
            },
            onMessage: (message) => {
                if (message.type === SocketMessageTypes.SEND_MESSAGE) {
                    const incomingMessage = message.data as SessionChatMessage;
                    setMessages((prev) => [...prev, incomingMessage]);
                }
                // You can handle other message types like system or typing indicators here
            },
        };

        clientRef.current = new TelepartyClient(eventHandler);
    }, []);

    const createRoom = async (nickname: string, userIcon?: string) => {
        if (!clientRef.current) return;
        const newRoomId = await clientRef.current.createChatRoom(nickname, userIcon);
        setRoomId(newRoomId);
        return newRoomId;
    };

    const joinRoom = (nickname: string, joinRoomId: string, userIcon?: string) => {
        if (!clientRef.current) return;
        clientRef.current.joinChatRoom(nickname, joinRoomId, userIcon);
        setRoomId(joinRoomId);
    };

    const sendMessage = (body: string) => {
        if (!clientRef.current) return;
        clientRef.current.sendMessage(SocketMessageTypes.SEND_MESSAGE, { body });
    };

    return {
        isConnected,
        messages,
        roomId,
        createRoom,
        joinRoom,
        sendMessage,
    };
};
