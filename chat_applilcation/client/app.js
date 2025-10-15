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
import timeService, { formatTime } from "./js/services/timeService.js";
import sessionTimerService from "./js/services/sessionTimerService.js";

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
  initTimeService();
  initSessionTimer();
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

// Initialize time service
async function initTimeService() {
  const timeElement = document.getElementById("time-text");

  if (!timeElement) {
    console.warn("Time display element not found");
    return;
  }

  // Initialize the shared worker connection
  const success = await timeService.init();

  if (!success) {
    timeElement.textContent = "Time service unavailable";
    return;
  }

  // Subscribe to time updates
  timeService.subscribe((timeData) => {
    const { formatted } = timeData;
    timeElement.textContent = `${formatted.date} ${formatted.time}`;
  });

  // Start time updates every second
  timeService.startUpdates(1000);

  console.log("Time service initialized successfully");
}

// Initialize session timer service
async function initSessionTimer() {
  const sessionTimeElement = document.getElementById("session-time");

  if (!sessionTimeElement) {
    console.warn("Session timer display element not found");
    return;
  }

  // Initialize the dedicated worker
  const success = await sessionTimerService.init();

  if (!success) {
    sessionTimeElement.textContent = "Timer unavailable";
    return;
  }

  // Subscribe to session timer updates
  sessionTimerService.subscribe((sessionData) => {
    sessionTimeElement.textContent = sessionData.formattedDuration;

    // Add visual indicator when session is running
    if (sessionData.isRunning) {
      sessionTimeElement.classList.add("running");
    } else {
      sessionTimeElement.classList.remove("running");
    }
  });

  // Start the session timer
  sessionTimerService.startSession();

  console.log("Session timer service initialized successfully");
}

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  // Stop the session timer when leaving the page
  if (sessionTimerService.isSessionRunning()) {
    sessionTimerService.stopSession();
  }
});
