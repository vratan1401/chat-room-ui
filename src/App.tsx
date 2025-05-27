import React, { useState, useRef } from 'react';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTelepartySocket } from './hooks/useTelepartySocket';
import ChatRoomUI from './components/ChatRoomUI';

function App() {
  const [nickname, setNickname] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [userIcon, setUserIcon] = useState<string>();

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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/.test(file.type))
      return toast.error('Upload PNG/JPEG');
    const reader = new FileReader();
    reader.onload = () => setUserIcon(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!nickname.trim()) return toast.error('Enter a nickname');
    try {
      await createRoom(nickname, userIcon);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleJoin = async () => {
    if (!nickname.trim() || !roomIdInput.trim())
      return toast.error('Enter nickname & room ID');
    try {
      await joinRoom(nickname, roomIdInput, userIcon);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const startResize = () => {
    isResizing.current = true;
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
  };
  const doResize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const w = e.clientX;
    const min = 200,
        max = window.innerWidth - 200;
    if (w > min && w < max) setSidebarWidth(w);
  };
  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
  };

  return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="app-container">
          <div className="sidebar" style={{ width: sidebarWidth }}>
            <h2>
              {roomId ? 'Join or Create Another Room' : 'Welcome to Chat'}
            </h2>

            <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nickname"
                disabled={!!roomId}
            />
            <input
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Room ID"
                disabled={!!roomId}
            />

            <label htmlFor="avatar-upload">Avatar (optional)</label>
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
                    alt="Preview"
                    className="avatar-preview"
                />
            )}

            <div className="button-group">
              <button
                  onClick={handleCreate}
                  disabled={isCreating || !!roomId}
              >
                {isCreating ? 'Creating…' : 'Create Room'}
              </button>
              <button
                  onClick={handleJoin}
                  disabled={isJoining || !!roomId}
              >
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

          <div className="divider" onMouseDown={startResize} />

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
                <p className="placeholder">Join or create to chat.</p>
            )}
          </div>
        </div>
      </>
  );
}

export default App;
