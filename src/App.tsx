import React, { useState } from 'react';
import './App.css';
import { useTelepartySocket } from './hooks/useTelepartySocket';
import ChatRoomUI from './components/ChatRoomUI';

function App() {
  const [nickname, setNickname] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  const {
    messages,
    isConnected,
    roomId,
    createRoom,
    joinRoom,
    sendMessage,
  } = useTelepartySocket();

  const handleCreateRoom = async () => {
    if (!nickname.trim()) return alert('Please enter a nickname');
    const newRoomId = await createRoom(nickname);
    setActiveRoomId(newRoomId || '');
    setHasJoined(true);
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomIdInput.trim()) {
      return alert('Please enter both nickname and room ID');
    }
    joinRoom(nickname, roomIdInput);
    setActiveRoomId(roomIdInput);
    setHasJoined(true);
  };

  return (
      <div className="app-container">
        {/* Left side - Sidebar */}
        <div className="sidebar">
          <h2>{hasJoined ? 'Join or Create Another Room' : 'Welcome to Chat Room'}</h2>
          <input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
          />
          <input
              type="text"
              placeholder="Enter Room ID (to join)"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
          />
          <div className="button-group">
            <button onClick={handleCreateRoom}>Create Room</button>
            <button onClick={handleJoinRoom}>Join Room</button>
          </div>
          <p>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
          {activeRoomId && <p><strong>Room ID:</strong> {activeRoomId}</p>}
        </div>

        {/* Right side - Chat */}
        <div className="chat-panel">
          {hasJoined && activeRoomId ? (
              <ChatRoomUI
                  roomId={activeRoomId}
                  messages={messages}
                  onSendMessage={sendMessage}
                  userNickname={nickname}
              />
          ) : (
              <p className="placeholder">Join or create a room to begin chatting.</p>
          )}
        </div>
      </div>
  );
}

export default App;
