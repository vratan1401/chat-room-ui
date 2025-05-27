// src/components/ChatRoomUI.tsx
import React, { useState } from 'react';
import { SessionChatMessage } from 'teleparty-websocket-lib';
import './ChatRoomUI.css'; // Optional: move scoped styles here if needed

interface ChatRoomUIProps {
    roomId: string;
    messages: SessionChatMessage[];
    onSendMessage: (text: string) => void;
    userNickname: string;
}

const ChatRoomUI: React.FC<ChatRoomUIProps> = ({
                                                   roomId,
                                                   messages,
                                                   onSendMessage,
                                                   userNickname,
                                               }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text.trim());
            setText('');
        }
    };

    return (
        <>
            <h2 style={{ marginBottom: '1rem' }}>Room ID: {roomId}</h2>
            <div className="chat-box">
                {messages.map((msg, idx) => {
                    const isOwn = msg.userNickname === userNickname;
                    const className = `chat-message ${msg.isSystemMessage ? 'system' : isOwn ? 'right' : 'left'}`;

                    return (
                        <div key={idx} className={className}>
                            {msg.isSystemMessage ? (
                                <em>{msg.body}</em>
                            ) : (
                                <>
                                    {!isOwn && <strong>{msg.userNickname}: </strong>}
                                    {msg.body}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="chat-input">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </>
    );
};

export default ChatRoomUI;
