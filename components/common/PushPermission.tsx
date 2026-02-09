"use client";

import { useEffect } from "react";
import { pushNotificationService } from "@/lib/push-notification-service";

export function PushPermission() {
  useEffect(() => {
    async function fetchPushNotifications() {
      await pushNotificationService.requestPermission();
    }
    fetchPushNotifications()
      .then((res) => {})
      .catch((err) => {
        console.error("Error requesting push notification permission", err);
      });
  }, []);

  return null;
}
