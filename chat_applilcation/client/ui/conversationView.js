export function renderConversationView(conversationId, messages, onBack) {
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
    // Container for image + bubble
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-wrapper");

    // User image
    const userImg = document.createElement("img");
    userImg.src = `/images/users/${message.from}.jpg`;
    userImg.alt = message.from;
    userImg.classList.add("user-avatar");

    // Bubble
    const messageElement = document.createElement("div");
    messageElement.classList.add("speech-bubble");
    messageElement.textContent = message.message;

    // Append image and bubble to wrapper
    messageWrapper.appendChild(userImg);
    messageWrapper.appendChild(messageElement);
    list.appendChild(messageWrapper);
  });

  messagesContainer.appendChild(list);

  // input bar
  const inputBar = document.createElement("div");
  inputBar.classList.add("message-input-bar");
  inputBar.innerHTML = `
    <input type="text" id="send-message-input" placeholder="Type a message..." />
    <button id="send-message-button">Send</button>
  `;
  messagesContainer.appendChild(inputBar);

  // back button
  const backButton = document.createElement("button");
  backButton.textContent = "← Back to conversations";
  backButton.classList.add("back-button");
  backButton.addEventListener("click", onBack);
  messagesContainer.appendChild(backButton);
}
