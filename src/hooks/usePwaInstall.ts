import { useState, useEffect, useCallback } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Register the sw.js Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.warn("[PWA] Service Worker registration failed:", error);
        });
    }

    // 2. Check if already installed / running in standalone window
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      setCanInstall(false);
      return;
    }

    // 3. Listen for beforeinstallprompt event from Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default Chrome mini-infobar from appearing automatically
      e.preventDefault();
      // Stash the event so it can be triggered later by user interaction
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Unhide the custom "Install App" button
      setCanInstall(true);
      console.log("[PWA] beforeinstallprompt event captured; install button ready");
    };

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log("[PWA] NISQ Vanguard app successfully installed");
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Trigger the saved installation prompt when user clicks the UI button
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn("[PWA] No deferred prompt available");
      return false;
    }

    try {
      // Show Chrome's native install prompt
      await deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response to install prompt: ${outcome}`);

      if (outcome === "accepted") {
        setCanInstall(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[PWA] Error showing install prompt:", err);
      return false;
    }
  }, [deferredPrompt]);

  return {
    canInstall,
    isInstalled,
    promptInstall,
  };
}
