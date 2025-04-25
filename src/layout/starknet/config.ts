import { publicProvider } from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";
import {
  isInArgentMobileAppBrowser,
  ArgentMobileConnector,
} from "starknetkit/argentMobile";
import {
  BraavosMobileConnector,
  isInBraavosMobileAppBrowser,
} from "starknetkit/braavosMobile";
import { InjectedConnector } from "starknetkit/injected";
import { WebWalletConnector } from "starknetkit/webwallet";
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
    return [
      ArgentMobileConnector.init({
        options: {
          url: typeof window !== "undefined" ? window.location.href : "",
          dappName: "Garden app",
          chainId: CHAIN_ID,
        },
      }),
    ];
  }

  if (isInBraavosMobileAppBrowser()) {
    return [BraavosMobileConnector.init({})];
  }

  return [
    new InjectedConnector({ options: { id: "argentX" } }),
    new InjectedConnector({ options: { id: "braavos" } }),
    new InjectedConnector({ options: { id: "keplr" } }),
    ArgentMobileConnector.init({
      options: {
        url: typeof window !== "undefined" ? window.location.href : "",
        dappName: "Garden dapp",
        chainId: CHAIN_ID,
      },
    }),
    new WebWalletConnector({ url: ARGENT_WEBWALLET_URL, theme: "dark" }),
  ].filter((connector) => connector !== null);
};

export const connectors = availableConnectors();

const starknetChains = [mainnet, sepolia];
const starknetProviders = publicProvider();

export { starknetChains, starknetProviders };
