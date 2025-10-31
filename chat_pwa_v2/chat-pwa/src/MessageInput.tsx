import { useState } from "react";
import MessageService from "./services/MessageService";
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
    <div className="message-input-bar">
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
  );
}
