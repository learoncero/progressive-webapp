import { useState, useEffect } from "react";
import PushNotificationService from "./services/PushNotificationService";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Check current notification permission status
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  async function handleEnableNotifications() {
    try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      console.log("Service Worker ready, requesting permission...");

      // Request notification permission (must be from user interaction)
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        // Subscribe to push notifications
        const subscription = await PushNotificationService.subscribe(
          registration
        );
        await PushNotificationService.sendSubscriptionToServer(subscription);
        console.log("Successfully subscribed to push notifications");
      } else {
        console.warn("Notification permission denied");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    }
  }

  async function handleNotifyNewVersion() {
    try {
      console.log("Sending new version notification...");
      const result = await PushNotificationService.notifyNewAppVersion();
      console.log("Notification result:", result);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  return (
    <div className="admin-panel">
      <h3>Push Notifications</h3>

      {notificationPermission !== "granted" && (
        <div className="permission-section">
          <p>Enable notifications to receive updates:</p>
          <button onClick={handleEnableNotifications} className="enable-button">
            🔔 Enable Notifications
          </button>
        </div>
      )}

      {notificationPermission === "granted" && (
        <div className="admin-section">
          <p className="status">✅ Notifications enabled</p>
          <p>Notify users about a new app version:</p>
          <button onClick={handleNotifyNewVersion} className="notify-button">
            📢 Send "New Version" Notification
          </button>
        </div>
      )}
    </div>
  );
}
