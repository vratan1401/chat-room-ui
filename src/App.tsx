// src/App.tsx
import React, { useState, useRef } from "react";
import "./App.css";
import { useTelepartySocket } from "./hooks/useTelepartySocket";
import ChatRoomUI from "./components/ChatRoomUI";

function App() {
  const [nickname, setNickname] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  const isResizing = useRef(false);
  const [userIcon, setUserIcon] = useState<string | undefined>(undefined);

  const { messages, isConnected, createRoom, joinRoom, sendMessage } =
      useTelepartySocket();

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("Avatar file selected:", file.name, file.type);

    // Only allow PNG / JPEG
    if (!/^image\/(png|jpe?g)$/.test(file.type)) {
      alert("Please upload a PNG or JPEG image");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      console.log("Avatar data URL length:", result.length);
      setUserIcon(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateRoom = async () => {
    if (!nickname.trim()) return alert("Please enter a nickname");
    if (!userIcon) return alert("Please select an avatar first");

    console.log("Creating room; nickname=", nickname, "icon:", userIcon);
    try {
      const newRoomId = await createRoom(nickname, userIcon);
      console.log("Created room ID:", newRoomId);
      setActiveRoomId(newRoomId || "");
      setHasJoined(true);
    } catch (err) {
      console.error("Failed to create room:", err);
      alert("Error creating room: " + (err as Error).message);
    }
  };

  const handleJoinRoom = () => {
    if (!nickname.trim() || !roomIdInput.trim()) {
      return alert("Please enter both nickname and room ID");
    }
    if (!userIcon) return alert("Please select an avatar first");

    console.log(
        "Joining room; nickname=",
        nickname,
        "roomId=",
        roomIdInput,
        "icon:",
        userIcon
    );
    try {
      joinRoom(nickname, roomIdInput, userIcon);
      setActiveRoomId(roomIdInput);
      setHasJoined(true);
    } catch (err) {
      console.error("Failed to join room:", err);
      alert("Error joining room: " + (err as Error).message);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing.current) {
      const newW = e.clientX;
      const min = 200,
          max = window.innerWidth - 200;
      if (newW > min && newW < max) setSidebarWidth(newW);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
      <div className="app-container">
        {/* Left side - Sidebar */}
        <div className="sidebar" style={{ width: sidebarWidth, flex: "none" }}>
          <h2>
            {hasJoined
                ? "Join or Create Another Room"
                : "Welcome to Chat Room"}
          </h2>

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

          {/* Avatar picker moved ABOVE the buttons */}
          <label htmlFor="avatar-upload">Select Avatar:</label>
          <input
              id="avatar-upload"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleAvatarUpload}
          />
          {userIcon && (
              <img
                  src={userIcon}
                  alt="Avatar Preview"
                  className="avatar-preview"
              />
          )}

          <div className="button-group">
            <button onClick={handleCreateRoom}>Create Room</button>
            <button onClick={handleJoinRoom}>Join Room</button>
          </div>

          <p>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
          {activeRoomId && (
              <p>
                <strong>Room ID:</strong> {activeRoomId}
              </p>
          )}
        </div>

        {/* Draggable divider */}
        <div className="divider" onMouseDown={handleMouseDown} />

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
              <p className="placeholder">
                Join or create a room to begin chatting.
              </p>
          )}
        </div>
      </div>
  );
}

export default App;
