import {
  fetchConversations,
  fetchMessages,
  sendMessage,
} from "./js/api/chatApi.js";
import { initConnectionStatus } from "./js/services/connectionService.js";
import { initInstaller } from "./js/services/installerService.js";
import { renderConversationList } from "./ui/conversationList.js";
import { renderConversationView } from "./ui/conversationView.js";
import { initDb } from "./js/services/dbService.js";

const LOGGED_IN_USER = "manuel";

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", { type: "module" });
}

document.addEventListener("DOMContentLoaded", () => {
  initDb();
  initInstaller();
  initConnectionStatus();
  setupBackButtonHandler();

  // check for reset shortcut
  if (new URLSearchParams(window.location.search).get("resetLastChat")) {
    resetLastChatId();
  } else {
    loadConversations().then(() => {
      restoreLastChatId();
    });
  }
});

// Load list of conversations
async function loadConversations() {
  const loadingText = document.getElementById("loading-text-conversations");
  const listContainer = document.getElementById("conversation-list-container");
  const conversations = document.getElementById("conversations");
  conversations.innerHTML = "";
  const viewContainer = document.getElementById("conversation-view-container");
  const messagesContainer = document.getElementById("conversation-messages");
  messagesContainer.innerHTML = ""; // Clear previous messages

  // Show conversation list, hide view
  listContainer.hidden = false;
  viewContainer.hidden = true;

  loadingText.hidden = false;

  try {
    const conversations = await fetchConversations(LOGGED_IN_USER);
    renderConversationList(conversations, openConversation);
  } catch (err) {
    console.error(err);
    loadingText.textContent = "Failed to load conversations.";
  } finally {
    loadingText.hidden = true;
  }
}

// open a specific conversation
async function openConversation(conversationId) {
  localStorage.setItem("lastChatId", conversationId);

  const loadingText = document.getElementById("loading-text-messages");
  const listContainer = document.getElementById("conversation-list-container");
  const viewContainer = document.getElementById("conversation-view-container");

  // Hide conversation list, show conversation view
  listContainer.hidden = true;
  viewContainer.hidden = false;

  loadingText.hidden = false;

  try {
    const messages = await fetchMessages(conversationId);
    renderConversationView(conversationId, messages);
    setupSendHandler(conversationId, messages);
  } catch (err) {
    console.error(err);
    loadingText.textContent = "Failed to load messages.";
  } finally {
    loadingText.hidden = true;
  }
}

function setupSendHandler(conversationId, messages) {
  const sendButton = document.getElementById("send-message-button");
  const messageInput = document.getElementById("send-message-input");

  if (!sendButton || !messageInput) return;

  // Reassign onclick for the current conversation
  sendButton.onclick = async () => {
    const text = messageInput.value.trim();
    if (!text) return;

    try {
      await sendMessage(conversationId, LOGGED_IN_USER, text);

      // Update the conversation's local messages array
      messages.push({ from: LOGGED_IN_USER, message: text });

      renderConversationView(conversationId, messages);

      messageInput.value = "";
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message.");
    }
  };
}

function setupBackButtonHandler() {
  const backButton = document.getElementById("back-button");
  if (!backButton) return;

  backButton.onclick = () => {
    loadConversations();
  };
}

// restore last chat on startup
function restoreLastChatId() {
  const lastChatId = localStorage.getItem("lastChatId");
  if (lastChatId) {
    openConversation(lastChatId);
  }
}

// reset last chat id
function resetLastChatId() {
  localStorage.removeItem("lastChatId");
}
