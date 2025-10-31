import { useEffect, useState } from "react";
import "./App.css";
import ConversationList from "./ConversationList";
import Header from "./Header";
import InstallButton from "./InstallButton";
import AdminPanel from "./AdminPanel";
import type { Conversation } from "./types";
import ConversationService from "./services/ConversationService";
import UserService from "./services/UserService";
import MessageService from "./services/MessageService";
import ConversationView from "./ConversationView";
import type { Message } from "./types";

const LOGGED_IN_USER = "manuel";

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const conversations = await ConversationService.getConversationsByUser(
      LOGGED_IN_USER
    );
    setConversations(conversations);

    const users = await UserService.getUsers();
    setUsers(users);
  }

  async function onSelectConversation(id: number) {
    setSelectedConversationId(id);
    await loadMessagesForConversation(id);
  }

  async function loadMessagesForConversation(id: number) {
    const msgs = await MessageService.getMessagesByConversationId(id);
    setMessages(msgs);
  }

  return (
    <div className="App">
      <Header />
      <div className="app-container">
        <div className="app-content">
          {selectedConversationId == null && (
            <ConversationList
              conversations={conversations}
              users={users}
              onSelectConversation={onSelectConversation}
            />
          )}
          {selectedConversationId !== null && (
            <ConversationView
              conversationId={selectedConversationId}
              messages={messages}
              users={users}
              currentUser={LOGGED_IN_USER}
              onClose={() => setSelectedConversationId(null)}
              onMessageSent={() =>
                loadMessagesForConversation(selectedConversationId)
              }
            />
          )}
        </div>
        <InstallButton />
        <AdminPanel />
      </div>
    </div>
  );
}
