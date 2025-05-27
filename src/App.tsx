// src/App.tsx
import React, { useState } from 'react';
import './styles/App.css';

function App() {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const handleCreateRoom = () => {
    if (!nickname) return alert("Please enter a nickname");
    // Call WebSocket logic later here
    console.log("Creating room...");
    setHasJoined(true);
  };

  const handleJoinRoom = () => {
    if (!nickname || !roomId) return alert("Please enter both nickname and room ID");
    // Call WebSocket logic later here
    console.log(`Joining room ${roomId}`);
    setHasJoined(true);
  };

  return (
      <div className="App">
        {!hasJoined ? (
            <div className="room-form">
              <h2>Welcome to Chat Room</h2>
              <input
                  type="text"
                  placeholder="Enter your nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
              />
              <input
                  type="text"
                  placeholder="Enter Room ID (to join)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
              />
              <div className="button-group">
                <button onClick={handleCreateRoom}>Create Room</button>
                <button onClick={handleJoinRoom}>Join Room</button>
              </div>
            </div>
        ) : (
            <div className="chat-view">
              <h3>You're in room: {roomId || '(New Room)'}</h3>
              {/* We'll render ChatWindow + MessageInput here */}
            </div>
        )}
      </div>
  );
}

export default App;
