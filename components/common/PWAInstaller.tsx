"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("Service Worker registered:", registration);

            // Check for updates
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (
                    newWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    toast.info("New version available! Refresh to update.", {
                      action: {
                        label: "Refresh",
                        onClick: () => window.location.reload(),
                      },
                    });
                  }
                });
              }
            });

            // Request notification permission after service worker is ready
            if ("Notification" in window && Notification.permission === "default") {
              setTimeout(() => {
                Notification.requestPermission().then((permission) => {
                  if (permission === "granted") {
                    console.log("Notification permission granted");
                    toast.success("Notifications enabled!");
                  } else if (permission === "denied") {
                    console.log("Notification permission denied");
                  }
                });
              }, 2000); // Delay to avoid overwhelming the user
            }
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setShowInstallButton(true);
      console.log("PWA: Install prompt captured, custom banner will be shown");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    // Check if already running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    if (isStandalone) {
      console.log("App is running as installed PWA");
    }

    // Handle app installed
    window.addEventListener("appinstalled", () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
      toast.success("App installed successfully!");
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("PWA: No install prompt available");
      return;
    }

    console.log("PWA: Showing install prompt");
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA: User accepted the install prompt");
      toast.success("Installing app...");
    } else {
      console.log("PWA: User dismissed the install prompt");
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    console.log("PWA: User dismissed install banner");
    setShowInstallButton(false);
    setDeferredPrompt(null);
  };

  return (
    <>
      {showInstallButton && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-orange-500 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold">Install Itesiwaju</p>
                <p className="text-sm text-white/90 mt-1">
                  Install our app for quick access and offline support
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 px-4 py-2 bg-white text-orange-500 rounded-md font-semibold hover:bg-orange-50 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 border border-white/30 text-white rounded-md font-semibold hover:bg-white/10 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
