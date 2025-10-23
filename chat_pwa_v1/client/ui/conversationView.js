export function renderConversationView(conversationId, messages, users) {
  const messagesContainer = document.getElementById("conversation-messages");
  messagesContainer.innerHTML = ""; // Clear previous messages

  // header
  const header = document.createElement("h2");
  header.textContent = `Conversation #${conversationId}`;
  messagesContainer.appendChild(header);

  // messages
  const list = document.createElement("div");
  list.classList.add("messages-list");

  messages.forEach((message) => {
    // Find user info
    const user = users.find((u) => u.username === message.from);

    // Container for image + name + bubble
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    // Left side: Avatar and name
    const userSection = document.createElement("div");
    userSection.classList.add("user-section");

    // User image
    const userImg = document.createElement("img");
    userImg.src = user?.image || `/images/users/default.jpg`;
    userImg.alt = user?.fullname || message.from;
    userImg.classList.add("user-avatar");

    // User name
    const nameElement = document.createElement("div");
    nameElement.classList.add("user-name");
    nameElement.textContent = user?.fullname || message.from;

    userSection.appendChild(userImg);
    userSection.appendChild(nameElement);

    // Message bubble
    const messageElement = document.createElement("div");
    messageElement.classList.add("speech-bubble");
    messageElement.textContent = message.message;

    // Append to wrapper
    messageWrapper.appendChild(userSection);
    messageWrapper.appendChild(messageElement);
    list.appendChild(messageWrapper);
  });

  messagesContainer.appendChild(list);
}
