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
