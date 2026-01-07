import { braavos, injected, legacyInjected, ready } from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import { isInArgentMobileAppBrowser } from "starknetkit/argentMobile";
import { isInBraavosMobileAppBrowser } from "starknetkit/braavosMobile";
import { RpcProvider } from "starknet";
import { network, STARKNET_CONFIG } from "../../constants/constants";
import { Network } from "@gardenfi/utils";

export const ARGENT_WEBWALLET_URL = "https://sepolia-web.argent.xyz";
export const CHAIN_ID = network === Network.MAINNET ? "SN_MAIN" : "SN_SEPOLIA";

export const availableConnectors = () => {
  if (isInArgentMobileAppBrowser()) {
    return [ready()];
  }

  if (isInBraavosMobileAppBrowser()) {
    return [braavos()];
  }

  return [
    ready(),
    braavos(),
    injected({ id: "keplr" }),
    legacyInjected({ id: "okxwallet" }),
  ].filter((connector) => connector !== null);
};

export const connectors = availableConnectors();

const starknetChains = [mainnet, sepolia];

// Create a custom provider function using explicit RPC URLs to avoid version compatibility issues
// This function matches the signature expected by @starknet-react/core
const createStarknetProvider = () => {
  return () => {
    const config =
      network === Network.MAINNET
        ? STARKNET_CONFIG.starknet
        : STARKNET_CONFIG.starknet_sepolia;

    // Use the first RPC URL from the config
    return new RpcProvider({
      nodeUrl: config.nodeUrl[0],
    });
  };
};

const starknetProviders = createStarknetProvider();

export { starknetChains, starknetProviders };
