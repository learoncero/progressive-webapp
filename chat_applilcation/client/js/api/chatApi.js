const BASE_URL = "/conversations"; // adjust if needed

export async function fetchConversations(user) {
  const response = await fetch(`${BASE_URL}?user=${user}`);
  return response.json();
}

export async function fetchMessages(conversationId) {
  const response = await fetch(`${BASE_URL}/${conversationId}/messages`);
  return response.json();
}

export async function sendMessage(conversationId, from, message) {
  const response = await fetch(`${BASE_URL}/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, message }),
  });
  return response.json();
}
