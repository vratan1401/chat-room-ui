import React, {
    useState,
    useRef,
    useEffect,
    KeyboardEvent,
    FC,
} from 'react';
import { SessionChatMessage } from 'teleparty-websocket-lib';
import './ChatRoomUI.css';

interface ChatRoomUIProps {
    roomId: string;
    messages: SessionChatMessage[];
    onSendMessage: (text: string) => void;
    onTyping: (typing: boolean) => void;
    typingUsers: string[];
    userNickname: string;
}

const ChatRoomUI: FC<ChatRoomUIProps> = ({
                                             roomId,
                                             messages,
                                             onSendMessage,
                                             onTyping,
                                             typingUsers,
                                             userNickname,
                                         }) => {
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);
    const chatBoxRef = useRef<HTMLDivElement>(null);
    const typingTimeout = useRef<NodeJS.Timeout>(undefined);

    useEffect(() => {
        console.log('typingUsers:', typingUsers);
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages, typingUsers]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {}
    };

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        onSendMessage(trimmed);
        setText('');
        onTyping(false);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTyping = () => {
        onTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => onTyping(false), 1000);
    };

    return (
        <div className="chat-room-ui">
            <div className="chat-header">
                <h2 className="chat-title">Chat Room</h2>
                <button
                    className="copy-btn"
                    onClick={handleCopy}
                    aria-label="Copy Room ID"
                >
                    {copied ? 'Copied!' : 'Copy Room ID'}
                </button>
            </div>

            <div className="chat-box" ref={chatBoxRef} role="log" aria-live="polite">
                {messages.map((msg, idx) => {
                    const isOwn = msg.userNickname === userNickname;
                    const rowClass = msg.isSystemMessage
                        ? 'system-row'
                        : isOwn
                            ? 'own'
                            : 'other';

                    return (
                        <div key={idx} className={`chat-row ${rowClass}`}>
                            {!msg.isSystemMessage && !isOwn && msg.userIcon && (
                                <img
                                    src={msg.userIcon}
                                    alt={`${msg.userNickname} avatar`}
                                    className="avatar"
                                />
                            )}
                            <div
                                className={`chat-message ${
                                    msg.isSystemMessage
                                        ? 'system'
                                        : isOwn
                                            ? 'right'
                                            : 'left'
                                }`}
                            >
                                {msg.isSystemMessage ? (
                                    <em>
                                        {msg.userNickname
                                            ? `${msg.userNickname} ${msg.body}`
                                            : msg.body}
                                    </em>
                                ) : (
                                    <>
                                        {!isOwn && (
                                            <span className="author">{msg.userNickname}:</span>
                                        )}
                                        <span className="message-body">{msg.body}</span>
                                    </>
                                )}
                            </div>
                            {!msg.isSystemMessage && isOwn && msg.userIcon && (
                                <img
                                    src={msg.userIcon}
                                    alt="Your avatar"
                                    className="avatar"
                                />
                            )}
                        </div>
                    );
                })}

                {typingUsers.length > 0 && (
                    <div className="typing-indicator">
                        {typingUsers.join(', ')}{' '}
                        {typingUsers.length > 1 ? 'are' : 'is'} typing…
                    </div>
                )}
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type a message…"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={onKeyDown}
                    aria-label="Type a message"
                />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoomUI;
