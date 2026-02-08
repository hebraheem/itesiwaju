"use client";

export class PushNotificationService {
  private static instance: PushNotificationService;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return "denied";
    }

    return await Notification.requestPermission();
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      // Subscribe to push notifications
      // Note: You'll need to replace this with your actual VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
      
      if (!vapidPublicKey) {
        console.warn("VAPID public key not configured");
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to backend
      await this.sendSubscriptionToBackend(subscription);

      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        // Remove subscription from backend
        await this.removeSubscriptionFromBackend(subscription);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  }

  async sendLocalNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported");
      return;
    }

    if (Notification.permission === "granted") {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        ...options,
      });
    }
  }

  private async sendSubscriptionToBackend(
    subscription: PushSubscription
  ): Promise<void> {
    // Implement your backend API call here
    // Example:
    // await fetch('/api/push/subscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscription),
    // });
    console.log("Subscription to send to backend:", subscription);
  }

  private async removeSubscriptionFromBackend(
    subscription: PushSubscription
  ): Promise<void> {
    // Implement your backend API call here
    // Example:
    // await fetch('/api/push/unsubscribe', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ endpoint: subscription.endpoint }),
    // });
    console.log("Subscription to remove from backend:", subscription);
  }

  private urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
