const BASE_URL = "/conversations"; // adjust if needed

export async function fetchConversations(user) {
  const response = await fetch(`${BASE_URL}?user=${user}`);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchMessages(conversationId) {
  const response = await fetch(`${BASE_URL}/${conversationId}/messages`);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function sendMessage(conversationId, from, message) {
  const response = await fetch(`${BASE_URL}/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, message }),
  });
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function fetchUsers() {
  const response = await fetch(`/users`);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Network error" }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
}
