import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import PushNotificationService from "./services/PushNotificationService";

// Start the shared worker for time updates
if ("SharedWorker" in window) {
  const timeWorker = new SharedWorker(
    new URL("./workers/sharedWorker.js", import.meta.url),
    { type: "module" }
  );

  timeWorker.port.start();

  timeWorker.onerror = (error) => {
    console.error("Shared Worker error:", error);
  };
} else {
  console.warn("SharedWorker is not supported in this browser");
}

// Auto-subscribe if notifications are already granted
if ("serviceWorker" in navigator && "Notification" in window) {
  window.addEventListener("load", async () => {
    if (Notification.permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log("Notifications already enabled, re-subscribing...");

        const subscription = await PushNotificationService.subscribe(
          registration
        );
        await PushNotificationService.sendSubscriptionToServer(subscription);

        console.log("Auto-subscribed successfully");
      } catch (error) {
        console.error("Error auto-subscribing:", error);
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
