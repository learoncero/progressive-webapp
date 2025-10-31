export default class PushNotificationService {
  static async subscribe(
    registration: ServiceWorkerRegistration
  ): Promise<PushSubscription> {
    return registration.pushManager
      .getSubscription()
      .then(async (subscription) => {
        // If a subscription was found, return it.
        if (subscription) {
          return subscription;
        }
        // Otherwise subscribe
        const vapidPublicKey =
          "BMJXsOtT2dYG64ggKwp4FQ3ZZaslj0PjXNEi0mG6TwrkZpRb6jeb_bnzxbGWhzxlq5zg1ZGwpCi0vEhOpRHPrZQ";
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey,
        });

        return newSubscription;
      });
  }

  static async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      const response = await fetch("/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        console.log("Subscription sent to server successfully");
      } else {
        console.error("Failed to send subscription to server");
      }
    } catch (error) {
      console.error("Error sending subscription to server:", error);
    }
  }

  // Notify backend to send push notification about new app version
  static async notifyNewAppVersion() {
    try {
      const response = await fetch("/new-version", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("New version notification sent successfully:", result);
        return result;
      } else {
        const error = await response.text();
        console.error("Failed to send new version notification:", error);
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error sending new version notification:", error);
      throw error;
    }
  }
}
