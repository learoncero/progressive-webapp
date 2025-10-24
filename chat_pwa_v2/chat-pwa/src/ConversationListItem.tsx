import type { Conversation, User } from "./types";
import "./ConversationListItem.css";

type ConversationListItemProps = {
  conversation: Conversation;
  participantNames: string;
  users: User[];
  onSelect: (id: number) => void;
};

export default function ConversationListItem({
  conversation,
  participantNames,
  users,
  onSelect,
}: ConversationListItemProps) {
  return (
    <li
      key={conversation.id}
      className="conversation-item"
      onClick={() => onSelect(conversation.id)}
    >
      {/* Participant avatars */}
      <div className="participant-avatars">
        {conversation.participants.slice(0, 3).map((username) => {
          const user = users.find((u) => u.username === username);
          return (
            <img
              key={username}
              src={user?.image}
              alt={user?.fullname || username}
              className="participant-avatar"
            />
          );
        })}
      </div>

      {/* Conversation info */}
      <div className="conversation-info">
        <div className="conversation-title">
          Conversation #{conversation.id}
        </div>
        <div className="conversation-participants">{participantNames}</div>
      </div>
    </li>
  );
}
