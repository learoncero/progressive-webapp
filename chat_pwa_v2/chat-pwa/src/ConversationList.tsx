import type { Conversation, User } from "./types";
import "./ConversationList.css";
import ConversationListItem from "./ConversationListItem";

type ConversationListProps = {
  conversations: Conversation[];
  users: User[];
  onSelectConversation: (id: number) => void;
};

export default function ConversationList({
  conversations,
  users,
  onSelectConversation,
}: ConversationListProps) {
  function getParticipantNames(conversation: Conversation) {
    return conversation.participants
      .map((username) => {
        const user = users.find((u) => u.username === username);
        return user ? user.fullname : username;
      })
      .join(", ");
  }

  const items = conversations.map((conversation) => (
    <ConversationListItem
      key={conversation.id}
      conversation={conversation}
      participantNames={getParticipantNames(conversation)}
      users={users}
      onSelect={onSelectConversation}
    />
  ));

  return (
    <div id="conversations">
      <ul className="conversation-list">{items}</ul>
    </div>
  );
}
