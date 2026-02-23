"use client";

import { api } from "@/convex/_generated/api";
import { convexServer } from "@/lib/convexServer";
import { Id } from "@/convex/_generated/dataModel";
import { getUserSubscriptions } from "@/convex/notifications";

export class PushNotificationService {
  private static instance: PushNotificationService;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /** Ask the user for notification permission */
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return "denied";
    }

    return await Notification.requestPermission();
  }

  /** Subscribe the user to push notifications */
  async subscribe(userId: string): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      // Already subscribed?
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await this.sendSubscriptionToBackend(
          existingSubscription,
          userId as Id<"users">,
        );
        return existingSubscription;
      }

      // Subscribe
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
      if (!vapidPublicKey) {
        console.warn("VAPID public key not configured");
        return null;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to backend (Convex)
      await this.sendSubscriptionToBackend(subscription, userId as Id<"users">);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      return null;
    }
  }

  /** Unsubscribe the user */
  async unsubscribe(): Promise<boolean> {
    if (!("serviceWorker" in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromBackend(subscription);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      return false;
    }
  }

  /** Show a local notification immediately */
  async sendLocalNotification(
    title: string,
    options?: NotificationOptions,
  ): Promise<void> {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        ...options,
      });
    }
  }

  /** Send subscription info to the backend */
  private async sendSubscriptionToBackend(
    subscription: PushSubscription,
    userId: Id<"users">,
  ) {
    try {
      const sub = convexServer.query(api.notifications.getUserSubscriptions, {
        userId,
      });
      const existing = (await sub).find(
        (s) => s.endpoint === subscription.endpoint,
      );
      if (existing) {
        // console.log(
        //   "Subscription already exists in backend:",
        //   subscription.endpoint,
        // );
        return;
      }
      await convexServer.mutation(api.notifications.addSubscription, {
        subscription: JSON.stringify(subscription),
        userId,
      });
      console.log("Subscription saved to backend:", subscription.endpoint);
    } catch (error) {
      console.error("Failed to save subscription:", error);
    }
  }

  /** Remove subscription from the backend */
  private async removeSubscriptionFromBackend(subscription: PushSubscription) {
    try {
      await convexServer.mutation(api.notifications.removeSubscription, {
        endpoint: subscription.endpoint,
      });
      console.log("Subscription removed from backend:", subscription.endpoint);
    } catch (error) {
      console.error("Failed to remove subscription:", error);
    }
  }

  /** Convert VAPID public key to UInt8Array for pushManager */
  private urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
