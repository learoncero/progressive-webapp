import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  fetchUsers,
} from "./js/api/chatApi.js";
import { initConnectionStatus } from "./js/services/connectionService.js";
import { initInstaller } from "./js/services/installerService.js";
import { renderConversationList } from "./ui/conversationList.js";
import { renderConversationView } from "./ui/conversationView.js";
import { initDb } from "./js/services/dbService.js";
import {
  getLastChatId,
  setLastChatId,
  clearLastChatId,
} from "./js/services/storageService.js";

const LOGGED_IN_USER = "manuel";

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js", { type: "module" });
}

document.addEventListener("DOMContentLoaded", () => {
  initDb();
  fetchUsers();
  initInstaller();
  initConnectionStatus();
  initDedicatedWorker();
  setupBackButtonHandler();

  // check for reset shortcut
  if (new URLSearchParams(window.location.search).get("resetLastChat")) {
    clearLastChatId();
  } else {
    loadConversations().then(() => {
      const lastChatId = getLastChatId();
      if (lastChatId) {
        openConversation(lastChatId);
      }
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
    const users = await fetchUsers();
    renderConversationList(conversations, openConversation, users);
  } catch (err) {
    console.error(err);
    loadingText.textContent = "Failed to load conversations.";
  } finally {
    loadingText.hidden = true;
  }
}

// open a specific conversation
async function openConversation(conversationId) {
  setLastChatId(conversationId);

  const loadingText = document.getElementById("loading-text-messages");
  const listContainer = document.getElementById("conversation-list-container");
  const viewContainer = document.getElementById("conversation-view-container");

  // Hide conversation list, show conversation view
  listContainer.hidden = true;
  viewContainer.hidden = false;

  loadingText.hidden = false;

  try {
    const messages = await fetchMessages(conversationId);
    const users = await fetchUsers();
    renderConversationView(conversationId, messages, users);
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
      const users = await fetchUsers();

      // Update the conversation's local messages array
      messages.push({ from: LOGGED_IN_USER, message: text });

      renderConversationView(conversationId, messages, users);

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

// Initialize dedicated and shared workers for session timer and date/time
function renderSessionTime(event) {
  if (event.data.currentValue) {
    document.querySelector("#session-time").innerHTML = event.data.currentValue;
  }
}

function renderCurrentTime(event) {
  if (event.data.currentValue) {
    document.querySelector("#current-time-text").innerHTML =
      event.data.currentValue;
  }
}

let dedicatedWorker;
let sharedWorker;
function initDedicatedWorker() {
  if ("Worker" in window) {
    dedicatedWorker = new Worker("./js/workers/dedicatedWorker.js");
    dedicatedWorker.onmessage = renderSessionTime;

    sharedWorker = new SharedWorker("./js/workers/sharedWorker.js");
    sharedWorker.port.onmessage = renderCurrentTime;

    console.log("Dedicated and shared workers initialized successfully");
  } else {
    console.warn("Web Workers not supported in this browser");
    document.querySelector("#session-time").innerHTML = "Timer unavailable";
  }
}
