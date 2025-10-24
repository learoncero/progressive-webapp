import type { Message, User } from "./types";
import "./MessagesList.css";

type MessagesListProps = {
  messages: Message[];
  users: User[];
};

export default function MessagesList({ messages, users }: MessagesListProps) {
  return (
    <div className="messages-list">
      {messages.length === 0 ? (
        <div className="empty">No messages</div>
      ) : (
        messages.map((m, i) => {
          const user = users.find((u) => u.username === m.from);
          return (
            <div key={i} className="message-wrapper">
              <div className="user-section">
                <img
                  src={user?.image}
                  alt={user?.fullname || m.from}
                  className="user-avatar"
                />
                <div className="user-name">{user?.fullname || m.from}</div>
              </div>

              {/* Message bubble */}
              <div className="speech-bubble">{m.message}</div>
            </div>
          );
        })
      )}
    </div>
  );
}
