import { useEffect, useRef, useState } from 'react';
import {
    TelepartyClient,
    SocketEventHandler,
    SocketMessageTypes,
    SessionChatMessage,
} from 'teleparty-websocket-lib';
import { toast } from 'react-toastify';

export const useTelepartySocket = () => {
    const [messages, setMessages] = useState<SessionChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const clientRef = useRef<TelepartyClient | null>(null);
    const [roomId, setRoomId] = useState<string | null>(null);

    // Remember last nick/icon for reconnect and typing events
    const userSettingsRef = useRef<{ nick?: string; icon?: string }>({});

    // Initialize or reinitialize the WebSocket client
    const initClient = () => {
        clientRef.current?.teardown();

        const handler: SocketEventHandler = {
            onConnectionReady: () => {
                setIsConnected(true);
                toast.success('🟢 Connected to server');
            },
            onClose: () => {
                setIsConnected(false);
                toast.error('🔴 Disconnected from server');
            },
            onMessage: (raw) => {
                switch (raw.type) {
                    case SocketMessageTypes.SEND_MESSAGE: {
                        const m = raw.data as SessionChatMessage;
                        setMessages((prev) => [...prev, m]);
                        break;
                    }
                    case SocketMessageTypes.SET_TYPING_PRESENCE: {
                        const d = raw.data as { typing: boolean; userNickname: string };
                        setTypingUsers((prev) => {
                            if (d.typing) {
                                return prev.includes(d.userNickname)
                                    ? prev
                                    : [...prev, d.userNickname];
                            } else {
                                return prev.filter((n) => n !== d.userNickname);
                            }
                        });
                        break;
                    }
                }
            },
        };

        clientRef.current = new TelepartyClient(handler);
    };

    useEffect(() => {
        initClient();
        return () => {
            clientRef.current?.teardown();
        };
    }, []);

    const createRoom = async (nick: string, icon?: string) => {
        if (!clientRef.current) throw new Error('Socket not ready');
        setIsCreating(true);
        userSettingsRef.current = { nick, icon };
        try {
            const newId = await clientRef.current.createChatRoom(nick, icon);
            setRoomId(newId);
            setMessages([]); // no history on new room
            return newId;
        } finally {
            setIsCreating(false);
        }
    };

    const joinRoom = async (nick: string, id: string, icon?: string) => {
        if (!clientRef.current) throw new Error('Socket not ready');
        setIsJoining(true);
        userSettingsRef.current = { nick, icon };
        try {
            const { messages: history } = await clientRef.current.joinChatRoom(
                nick,
                id,
                icon
            );
            setRoomId(id);
            setMessages(history);
            return history;
        } finally {
            setIsJoining(false);
        }
    };

    const sendMessage = (body: string) => {
        clientRef.current?.sendMessage(SocketMessageTypes.SEND_MESSAGE, { body });
    };

    const sendTyping = (typing: boolean) => {
        const nick = userSettingsRef.current.nick;
        if (!nick) return;
        clientRef.current?.sendMessage(
            SocketMessageTypes.SET_TYPING_PRESENCE,
            { typing, userNickname: nick }
        );
    };

    const reconnect = () => {
        initClient();
        if (roomId && userSettingsRef.current.nick) {
            joinRoom(
                userSettingsRef.current.nick,
                roomId,
                userSettingsRef.current.icon
            ).catch((e) => toast.error(e.message));
        }
    };

    const leaveRoom = () => {
        clientRef.current?.teardown();
        setRoomId(null);
        setMessages([]);
        setIsConnected(false);
    };

    return {
        messages,
        isConnected,
        isJoining,
        isCreating,
        typingUsers,
        roomId,
        createRoom,
        joinRoom,
        sendMessage,
        sendTyping,
        reconnect,
        leaveRoom,
    };
};
