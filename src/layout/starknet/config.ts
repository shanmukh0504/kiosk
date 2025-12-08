import { braavos, injected, publicProvider, ready } from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import { isInArgentMobileAppBrowser } from "starknetkit/argentMobile";
import { isInBraavosMobileAppBrowser } from "starknetkit/braavosMobile";
import { constants } from "starknet";
import { network } from "../../constants/constants";
import { Network } from "@gardenfi/utils";

export const ARGENT_WEBWALLET_URL = "https://sepolia-web.argent.xyz";
export const CHAIN_ID =
  network === Network.MAINNET
    ? constants.NetworkName.SN_MAIN
    : constants.NetworkName.SN_SEPOLIA;

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
    injected({ id: "okxwallet" }),
  ].filter((connector) => connector !== null);
};

export const connectors = availableConnectors();

const starknetChains = [mainnet, sepolia];
const starknetProviders = publicProvider();

export { starknetChains, starknetProviders };
