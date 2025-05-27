// src/components/ChatRoomUI.tsx
import React, {
    useState,
    useRef,
    useEffect,
    KeyboardEvent,
    FC,
} from "react";
import { SessionChatMessage } from "teleparty-websocket-lib";
import "./ChatRoomUI.css";

interface ChatRoomUIProps {
    roomId: string;
    messages: SessionChatMessage[];
    onSendMessage: (text: string) => void;
    userNickname: string;
}

const ChatRoomUI: FC<ChatRoomUIProps> = ({
                                             roomId,
                                             messages,
                                             onSendMessage,
                                             userNickname,
                                         }) => {
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    // auto-scroll
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]);

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
        setText("");
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chat-room-ui">
            <div className="chat-header">
                <h2 className="chat-title">Chat Room</h2>
                <button
                    type="button"
                    className="copy-btn"
                    onClick={handleCopy}
                    aria-label="Copy Room ID"
                >
                    {copied ? "Copied!" : "Copy Room ID"}
                </button>
            </div>

            <div
                className="chat-box"
                ref={chatBoxRef}
                role="log"
                aria-live="polite"
            >
                {messages.map((msg, idx) => {
                    console.log('Rendering message:', msg.userNickname, msg.userIcon);
                    const isOwn = msg.userNickname === userNickname;
                    const rowClass = msg.isSystemMessage
                        ? "system-row"
                        : isOwn
                            ? "own"
                            : "other";

                    return (
                        <div key={idx} className={`chat-row ${rowClass}`}>
                            {/* LEFT side: other users’ avatars */}
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
                                        ? "system"
                                        : isOwn
                                            ? "right"
                                            : "left"
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

                            {/* RIGHT side: your own avatar */}
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
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type a message…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={onKeyDown}
                    aria-label="Type a message"
                />
                <button type="button" onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatRoomUI;
