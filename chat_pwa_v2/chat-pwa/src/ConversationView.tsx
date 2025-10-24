import type { Message, User } from "./types";
import "./ConversationView.css";
import BackButton from "./BackButton";
import MessagesList from "./MessagesList";

type ConversationViewProps = {
  conversationId: number;
  messages: Message[];
  users: User[];
  onClose: () => void;
};

export default function ConversationView({
  conversationId,
  messages,
  users,
  onClose,
}: ConversationViewProps) {
  return (
    <section className="conversation-view">
      <div id="conversation-messages">
        <h2>Conversation #{conversationId}</h2>
        <MessagesList messages={messages} users={users} />
        <BackButton onClick={onClose} />
      </div>
    </section>
  );
}
