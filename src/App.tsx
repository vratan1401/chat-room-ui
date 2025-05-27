import React, { useState, useRef } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTelepartySocket } from './hooks/useTelepartySocket';
import ChatRoomUI from './components/ChatRoomUI';

function App() {
  const [nickname, setNickname] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [userIcon, setUserIcon] = useState<string | undefined>(undefined);

  const [sidebarWidth, setSidebarWidth] = useState(300);
  const isResizing = useRef(false);

  const {
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
  } = useTelepartySocket();

  // Avatar picker (optional)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/.test(file.type)) {
      return toast.error('Please upload PNG/JPEG');
    }
    const reader = new FileReader();
    reader.onload = () => setUserIcon(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Create room
  const handleCreate = async () => {
    if (!nickname.trim()) return toast.error('Enter a nickname');
    try {
      await createRoom(nickname, userIcon);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Join room
  const handleJoin = async () => {
    if (!nickname.trim() || !roomIdInput.trim())
      return toast.error('Enter nickname & room ID');
    try {
      await joinRoom(nickname, roomIdInput, userIcon);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Sidebar drag
  const handleMouseDown = () => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newW = e.clientX;
    const min = 200,
        max = window.innerWidth - 200;
    if (newW > min && newW < max) setSidebarWidth(newW);
  };
  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="app-container">
          {/* Sidebar */}
          <div className="sidebar" style={{ width: sidebarWidth }}>
            <h2>
              {roomId ? 'Join or Create Another Room' : 'Welcome to Chat Room'}
            </h2>

            <input
                type="text"
                placeholder="Your nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={!!roomId}
            />
            <input
                type="text"
                placeholder="Room ID to join"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                disabled={!!roomId}
            />

            <label htmlFor="avatar-upload">Select Avatar (optional):</label>
            <input
                id="avatar-upload"
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleAvatarUpload}
                disabled={!!roomId}
            />
            {userIcon && (
                <img
                    src={userIcon}
                    alt="Avatar preview"
                    className="avatar-preview"
                />
            )}

            <div className="button-group">
              <button onClick={handleCreate} disabled={isCreating || !!roomId}>
                {isCreating ? 'Creating…' : 'Create Room'}
              </button>
              <button onClick={handleJoin} disabled={isJoining || !!roomId}>
                {isJoining ? 'Joining…' : 'Join Room'}
              </button>
            </div>

            <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
            {!isConnected && roomId && (
                <button className="reconnect-btn" onClick={reconnect}>
                  Reconnect
                </button>
            )}
            {roomId && (
                <button className="leave-btn" onClick={leaveRoom}>
                  Leave Room
                </button>
            )}
            {roomId && (
                <p>
                  <strong>Room ID:</strong> {roomId}
                </p>
            )}
          </div>

          <div className="divider" onMouseDown={handleMouseDown} />

          {/* Chat panel */}
          <div className="chat-panel">
            {(isCreating || isJoining) && (
                <div className="spinner-overlay">
                  <div className="spinner" />
                </div>
            )}

            {roomId ? (
                <ChatRoomUI
                    roomId={roomId}
                    messages={messages}
                    onSendMessage={sendMessage}
                    onTyping={sendTyping}
                    typingUsers={typingUsers}
                    userNickname={nickname}
                />
            ) : (
                <p className="placeholder">
                  Join or create a room to begin chatting.
                </p>
            )}
          </div>
        </div>
      </>
  );
}

export default App;
