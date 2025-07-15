import { CoinbaseWalletSDK } from "@coinbase/wallet-sdk";

/**
 * Coinbase Mini App SDK wrapper
 * Provides the sdk.isInMiniApp() functionality as required by Coinbase validation
 */
class CoinbaseMiniAppSDK {
  private sdk: CoinbaseWalletSDK | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.sdk = new CoinbaseWalletSDK({
          appName: "Garden Kiosk",
          appLogoUrl: window.location.origin + "/favicon.ico",
        });
      } catch (error) {
        console.warn("Failed to initialize Coinbase Wallet SDK:", error);
      }
    }
  }

  /**
   * Check if the app is running in a Coinbase Wallet Mini App environment
   * This is the method required by Coinbase validation
   */
  isInMiniApp(): boolean {
    if (typeof window === "undefined") return false;

    // Check if we're in a Coinbase Wallet environment
    const hasCoinbaseWallet =
      typeof window.ethereum !== "undefined" &&
      (window.ethereum as { isCoinbaseWallet?: boolean })?.isCoinbaseWallet ===
        true;

    if (!hasCoinbaseWallet) return false;

    // Check user agent for Mini App indicators
    const userAgent = window.navigator.userAgent || "";
    const isInMiniApp =
      userAgent.includes("MiniApp") ||
      userAgent.includes("WebView") ||
      userAgent.includes("CBWalletWebView");

    return isInMiniApp;
  }

  /**
   * Get the underlying Coinbase Wallet SDK instance
   */
  getSDK(): CoinbaseWalletSDK | null {
    return this.sdk;
  }

  /**
   * Check if the SDK is available
   */
  isAvailable(): boolean {
    return this.sdk !== null;
  }
}

// Create a singleton instance
const sdk = new CoinbaseMiniAppSDK();

export { sdk };
export default sdk;
