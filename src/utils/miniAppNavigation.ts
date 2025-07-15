/**
 * Mini App Navigation utilities for Coinbase Wallet Mini App
 */
import { sdk } from "./coinbaseMiniAppSDK";

export interface MiniAppNavigationOptions {
  url?: string;
  title?: string;
  data?: Record<string, unknown>;
}

// Interface for Mini App specific SDK methods
interface MiniAppSDK {
  navigate?: (
    url: string | undefined,
    options: { title?: string; data?: Record<string, unknown> }
  ) => void;
  getConfig?: () => Record<string, unknown>;
  share?: (data: Record<string, unknown>) => void;
  close?: () => void;
}

/**
 * Navigate within the Mini App or to external URLs
 */
export function navigateInMiniApp(options: MiniAppNavigationOptions): void {
  if (typeof window === "undefined") return;

  const { url, title, data } = options;

  if (sdk.isInMiniApp()) {
    try {
      const coinbaseSDK = sdk.getSDK();
      if (coinbaseSDK) {
        // Type assertion for Mini App specific methods
        const miniAppSDK = coinbaseSDK as MiniAppSDK;
        if (miniAppSDK?.navigate) {
          miniAppSDK.navigate(url, { title, data });
          return;
        }
      }
    } catch {
      console.warn(
        "Mini App navigation not available, falling back to standard navigation"
      );
    }
  }

  // Fallback to standard navigation
  if (url) {
    window.location.href = url;
  }
}

/**
 * Get Mini App specific configuration
 */
export function getMiniAppConfig() {
  if (typeof window === "undefined") return null;

  try {
    // Try to get Mini App configuration from Coinbase Wallet SDK
    const coinbaseSDK = sdk.getSDK();
    if (coinbaseSDK) {
      // Type assertion for Mini App specific methods
      const miniAppSDK = coinbaseSDK as MiniAppSDK;
      if (miniAppSDK?.getConfig) {
        return miniAppSDK.getConfig();
      }
    }
  } catch {
    console.warn("Could not get Mini App configuration");
  }

  return null;
}

/**
 * Share data with the parent Coinbase Wallet app
 */
export function shareWithParentApp(data: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  if (sdk.isInMiniApp()) {
    try {
      // Try to use Mini App sharing if available
      const coinbaseSDK = sdk.getSDK();
      if (coinbaseSDK) {
        // Type assertion for Mini App specific methods
        const miniAppSDK = coinbaseSDK as MiniAppSDK;
        if (miniAppSDK?.share) {
          miniAppSDK.share(data);
          return;
        }
      }
    } catch {
      console.warn("Mini App sharing not available");
    }
  }
}

/**
 * Close the Mini App and return to Coinbase Wallet
 */
export function closeMiniApp(): void {
  if (typeof window === "undefined") return;

  if (sdk.isInMiniApp()) {
    try {
      // Try to use Mini App close if available
      const coinbaseSDK = sdk.getSDK();
      if (coinbaseSDK) {
        // Type assertion for Mini App specific methods
        const miniAppSDK = coinbaseSDK as MiniAppSDK;
        if (miniAppSDK?.close) {
          miniAppSDK.close();
          return;
        }
      }
    } catch {
      console.warn("Mini App close not available");
    }
  }

  // Fallback: try to go back in history
  if (window.history.length > 1) {
    window.history.back();
  }
}
