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

  loadAllConversation();
});

function handleConnection(event) {
  document.querySelector("#status").textContent = event.type;
}

// Chat App Logic
async function loadAllConversation() {
  const content = document.getElementById("content");
  content.innerHTML = "<p>Loading conversations...</p>";

  console.log("Fetching /conversations");
  const response = await fetch("/conversations").catch((error) => {
    console.error("Fetch failed:", error);
    content.innerHTML = "<p>Failed to load conversations.</p>";
  });

  console.log("Response status: ", response.status);
  if (!response || !response.ok) {
    content.innerHTML = "<p>Failed to load conversations.</p>";
    return;
  }

  const conversations = await response.json();
  console.log("Fetched conversations:", conversations);

  renderConversations(conversations);
}

function renderConversations(conversations) {
  const content = document.getElementById("content");
  content.innerHTML = "<h1>Conversations</h1>";

  if (!conversations.length) {
    content.innerHTML += "<p>No conversations found.</p>";
    return;
  }

  const list = document.createElement("ul");
  for (const conversation of conversations) {
    const li = document.createElement("li");
    li.textContent = `Conversation #${
      conversation.id
    } (${conversation.participants.join(", ")})`;
    li.style.cursor = "pointer";
    // li.addEventListener("click", () => openConversation(conv.id));
    list.appendChild(li);
  }

  content.appendChild(list);
}
