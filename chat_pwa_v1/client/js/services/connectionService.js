// Online/Offline
export function initConnectionStatus() {
  const statusLabel = document.querySelector("#status");

  if (!statusLabel) return;

  // Initial state
  statusLabel.textContent = navigator.onLine ? "online" : "offline";

  // Listen for connection changes
  window.addEventListener("online", handleConnection);
  window.addEventListener("offline", handleConnection);
}

function handleConnection(event) {
  const statusLabel = document.querySelector("#status");
  if (statusLabel) {
    statusLabel.textContent = event.type;
  }
}
