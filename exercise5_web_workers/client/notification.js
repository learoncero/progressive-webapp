document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector("#notifyBtn")
    .addEventListener("click", requestAndNotify);
  document.querySelector("#pushBtn").addEventListener("click", postMessage);
});

function requestAndNotify(event) {
  Notification.requestPermission().then((result) => {
    if (result === "granted") {
      new Notification("Test Notification", {
        body: "Hello from the client!",
      });
    }
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((registration) => {
      console.log("subscribe...");
      return subscribe(registration);
    })
    .then((subscr) => {
      console.log("got subscription!");
      sendSubscriptionToServer(subscr);
    })
    .catch((error) => {
      console.warn(`ServiceWorker problem: ${error}`);
    });
}

function subscribe(registration) {
  return registration.pushManager.getSubscription().then(async (subscr) => {
    // If a subscription was found, return it.
    if (subscr) {
      return subscr;
    }
    // Otherwise subscribe
    const vapidPublicKey =
      "BH3-DzvVmRy3QnrDjr6S8C6QEssTy3dNk_O6SjV-yuKewZV6_SaAoTxBz3ZNfxrh50nariLtXUOApuL3Q3-Son0";
    return registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });
  });
}

var subscription; // we will need this later
function sendSubscriptionToServer(subscr) {
  subscription = subscr;
  fetch("http://localhost:8080/subscribe", {
    method: "post",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(subscr),
  });
}

function postMessage() {
  const input = document.querySelector("#messageInput");
  fetch("http://localhost:8080/message", {
    method: "post",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      subscription: subscription,
      payload: input.value,
    }),
  });
}
