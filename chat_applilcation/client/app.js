// Service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// Online/Offline
document.addEventListener("DOMContentLoaded", () => {
  // check initial if online
  document.querySelector("#status").textContent = navigator.onLine
    ? "online"
    : "offline";

  window.addEventListener("online", handleConnection);
  window.addEventListener("offline", handleConnection);

  loadAllConversations();
});

function handleConnection(event) {
  document.querySelector("#status").textContent = event.type;
}

// Chat App Logic
async function loadAllConversations() {
  const content = document.getElementById("content");
  content.innerHTML = "<p>Loading conversations...</p>";

  const response = await fetch("/conversations").catch((error) => {
    console.error("Fetch all conversations failed:", error);
    content.innerHTML = "<p>Failed to load conversations.</p>";
  });

  if (!response || !response.ok) {
    content.innerHTML = "<p>Failed to load conversations.</p>";
    return;
  }

  const conversations = await response.json();

  renderConversations(conversations);
}

function renderConversations(conversations) {
  const content = document.getElementById("content");
  content.innerHTML = "<h2>Conversations</h2>";

  if (!conversations.length) {
    content.innerHTML += "<p>No conversations found.</p>";
    return;
  }

  const conversationList = document.createElement("ul");
  conversationList.classList.add("conversation-list");

  for (const conversation of conversations) {
    const conversationListElement = document.createElement("li");
    conversationListElement.classList.add("conversation-item");
    conversationListElement.innerHTML = `
      <div class="conversation-info">
        <strong>Conversation #${conversation.id}</strong><br>
        <span>${conversation.participants.join(", ")}</span>
      </div>
    `;
    conversationListElement.style.cursor = "pointer";
    conversationListElement.addEventListener("click", () =>
      openConversation(conversation.id)
    );
    conversationList.appendChild(conversationListElement);
  }

  content.appendChild(conversationList);
}

async function openConversation(conversationId) {
  const content = document.getElementById("content");

  if (!content) {
    return;
  }

  // localStorage.setItem("lastChatId", conversationId);
  content.innerHTML = `<p>Loading conversation #${conversationId}...</p>`;

  const response = await fetch(
    `/conversations/${conversationId}/messages`
  ).catch((error) => {
    console.error("Fetch all conversations failed:", error);
    content.innerHTML = "<p>Failed to load conversation.</p>";
  });

  const messages = await response.json();
  console.log(messages);

  renderMessages(conversationId, messages);
}

function renderMessages(conversationId, messages) {
  const content = document.getElementById("content");
  content.innerHTML = "<h3>Conversation " + conversationId + "</h3>";

  const messagesContainer = document.createElement("div");
  messagesContainer.classList.add("messages-container");

  for (const message of messages) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("speech-bubble");
    messageElement.textContent = `${message.from}: ${message.message}`;
    messagesContainer.appendChild(messageElement);
  }

  content.appendChild(messagesContainer);

  const backButton = document.createElement("button");
  backButton.textContent = "<- Back to conversations";
  backButton.addEventListener("click", loadAllConversations);
  content.appendChild(backButton);
}
