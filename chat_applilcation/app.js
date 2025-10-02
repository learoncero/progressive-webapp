if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

document.addEventListener("DOMContentLoaded", () => {
  // check initial if online
  document.querySelector("#status").textContent = navigator.onLine
    ? "online"
    : "offline";
});

window.addEventListener("online", handleConnection);

window.addEventListener("offline", handleConnection);

function handleConnection(event) {
  document.querySelector("#status").textContent = event.type;
}
