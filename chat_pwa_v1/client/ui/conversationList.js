export function renderConversationList(
  conversations,
  onSelectConversation,
  users
) {
  const conversationListContainer = document.getElementById("conversations");

  const conversationList = document.createElement("ul");
  conversationList.classList.add("conversation-list");

  conversations.forEach((conversation) => {
    const conversationListElement = document.createElement("li");
    conversationListElement.classList.add("conversation-item");

    // Get full names for participants
    const participantNames = conversation.participants
      .map((username) => {
        const user = users.find((u) => u.username === username);
        return user ? user.fullname : username;
      })
      .join(", ");

    // Create participant avatars
    const avatarsContainer = document.createElement("div");
    avatarsContainer.classList.add("participant-avatars");

    conversation.participants.slice(0, 3).forEach((username) => {
      const user = users.find((u) => u.username === username);
      const avatar = document.createElement("img");
      avatar.src = user?.image || "/images/users/default.jpg";
      avatar.alt = user?.fullname || username;
      avatar.classList.add("participant-avatar");
      avatarsContainer.appendChild(avatar);
    });

    const conversationInfo = document.createElement("div");
    conversationInfo.classList.add("conversation-info");

    const titleElement = document.createElement("div");
    titleElement.classList.add("conversation-title");
    titleElement.textContent = `Conversation #${conversation.id}`;

    const participantsElement = document.createElement("div");
    participantsElement.classList.add("conversation-participants");
    participantsElement.textContent = participantNames;

    conversationInfo.appendChild(titleElement);
    conversationInfo.appendChild(participantsElement);

    conversationListElement.appendChild(avatarsContainer);
    conversationListElement.appendChild(conversationInfo);

    conversationListElement.addEventListener("click", () =>
      onSelectConversation(conversation.id)
    );
    conversationList.appendChild(conversationListElement);
  });

  conversationListContainer.innerHTML = ""; // Clear previous content
  conversationListContainer.appendChild(conversationList);
  conversationListContainer.style.display = "block";
}
