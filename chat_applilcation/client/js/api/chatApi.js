const BASE_URL = "/conversations"; // adjust if needed

export async function fetchConversations(user) {
  const response = await fetch(`${BASE_URL}?user=${user}`);
  if (!response.ok) throw new Error("Failed to load conversations");
  return response.json();
}

export async function fetchMessages(conversationId) {
  const response = await fetch(`${BASE_URL}/${conversationId}/messages`);
  if (!response.ok) throw new Error("Failed to load messages");
  return response.json();
}

export async function sendMessage(conversationId, from, message) {
  const response = await fetch(`${BASE_URL}/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, message }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}
