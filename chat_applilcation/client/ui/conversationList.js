export function renderConversationList(conversations, onSelectConversation) {
  const conversationListContainer = document.getElementById("conversations");

  const conversationList = document.createElement("ul");
  conversationList.classList.add("conversation-list");

  conversations.forEach((conversation) => {
    const conversationListElement = document.createElement("li");
    conversationListElement.classList.add("conversation-item");
    conversationListElement.innerHTML = `
        <div class="conversation-info">
          <strong>Conversation #${conversation.id}</strong><br>
          <span>${conversation.participants.join(", ")}</span>
        </div>
      `;
    conversationListElement.addEventListener("click", () =>
      onSelectConversation(conversation.id)
    );
    conversationList.appendChild(conversationListElement);
  });

  conversationListContainer.innerHTML = ""; // Clear previous content
  conversationListContainer.appendChild(conversationList);
  conversationListContainer.style.display = "block";
}
