import { useState } from "react";
import MessageService from "./services/MessageService";
import PhotoOverlay from "./PhotoOverlay";
import "./MessageInput.css";

type MessageInputProps = {
  conversationId: number;
  currentUser: string;
  onMessageSent: () => void;
};

export default function MessageInput({
  conversationId,
  currentUser,
  onMessageSent,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showPhotoOverlay, setShowPhotoOverlay] = useState(false);

  async function handleSend() {
    if (!message.trim() || isSending) {
      return;
    }

    setIsSending(true);
    try {
      await MessageService.sendMessage(
        conversationId.toString(),
        currentUser,
        message.trim()
      );
      setMessage("");
      onMessageSent();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <div className="message-input-bar">
        <button
          className="photo-button"
          onClick={() => setShowPhotoOverlay(true)}
          title="Take a photo"
        >
          📷
        </button>
        <input
          type="text"
          id="send-message-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isSending}
        />
        <button
          id="send-message-button"
          onClick={handleSend}
          disabled={isSending || !message.trim()}
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>

      {showPhotoOverlay && (
        <PhotoOverlay
          conversationId={conversationId}
          currentUser={currentUser}
          onClose={() => setShowPhotoOverlay(false)}
          onPhotoSent={onMessageSent}
        />
      )}
    </>
  );
}
