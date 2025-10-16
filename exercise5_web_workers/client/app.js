// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker.register("/sw.js");
// }

document.addEventListener("DOMContentLoaded", () => {
  // check initial if online
  document.querySelector("#status").textContent = navigator.onLine
    ? "online"
    : "offline";

  document.querySelector("#resetBtn").addEventListener("click", resetCounters);
});
window.addEventListener("online", handleConnection);
window.addEventListener("offline", handleConnection);
function handleConnection(event) {
  document.querySelector("#status").textContent = event.type;
}

function updateCounter(event) {
  if (event.data.currentValue) {
    document.querySelector("#dedicatedCounter").innerHTML =
      event.data.currentValue;
  }
}
let worker;
if ("Worker" in window) {
  worker = new Worker("./worker.js");
  worker.onmessage = updateCounter;
}

function updateSharedCounter(event) {
  if (event.data.currentValue) {
    document.querySelector("#sharedCounter").innerHTML =
      event.data.currentValue;
  }
}
let sharedWorker;
if ("Worker" in window) {
  sharedWorker = new SharedWorker("./sharedWorker.js");
  sharedWorker.port.onmessage = updateSharedCounter;
}

function resetCounters() {
  worker.postMessage({ command: "reset" });
  sharedWorker.port.postMessage({ command: "reset" });
}
