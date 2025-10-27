import type { Message, User } from "./types";
import "./ConversationView.css";
import BackButton from "./BackButton";
import MessagesList from "./MessagesList";
import MessageInput from "./MessageInput";

type ConversationViewProps = {
  conversationId: number;
  messages: Message[];
  users: User[];
  currentUser: string;
  onClose: () => void;
  onMessageSent: () => void;
};

export default function ConversationView({
  conversationId,
  messages,
  users,
  currentUser,
  onClose,
  onMessageSent,
}: ConversationViewProps) {
  return (
    <section className="conversation-view">
      <div id="conversation-messages">
        <h2>Conversation #{conversationId}</h2>
        <MessagesList messages={messages} users={users} />
      </div>
      <MessageInput
        conversationId={conversationId}
        currentUser={currentUser}
        onMessageSent={onMessageSent}
      />
      <BackButton onClick={onClose} />
    </section>
  );
}
