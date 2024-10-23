import { Connector } from "wagmi";
import { GetConnectorsReturnType } from "wagmi/actions";

type GardenSupportedEVMWallets = {
  id: string;
  name: string;
  logo: string;
  installLink: string;
};

export const GardenSupportedEVMWallets: Record<
  string,
  GardenSupportedEVMWallets
> = {
  metamask: {
    id: "io.metamask",
    name: "Metamask",
    logo: "https://garden-finance.imgix.net/wallets/metamask.svg",
    installLink: "https://metamask.io/download/",
  },
  brave: {
    id: "com.brave.wallet",
    name: "Brave Wallet",
    logo: "https://garden-finance.imgix.net/wallets/brave.svg",
    installLink: "https://brave.com/en-in/wallet/",
  },
  phantom: {
    id: "app.phantom",
    name: "Phantom",
    logo: "https://garden-finance.imgix.net/wallets/phantom.svg",
    installLink:
      "https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa?hl=en",
  },
  coinbase: {
    id: "com.coinbase.wallet",
    name: "Coinbase Wallet",
    logo: "https://garden-finance.imgix.net/wallets/coinbase.svg",
    installLink: "https://www.coinbase.com/wallet/downloads",
  },
  okx: {
    id: "com.okex.wallet",
    name: "OKX Wallet",
    logo: "https://garden-finance.imgix.net/wallets/okx.svg",
    installLink: "https://www.okx.com/download",
  },
  uniswap: {
    id: "org.uniswap.app",
    name: "Uniswap",
    logo: "https://garden-finance.imgix.net/wallets/uniswap.svg",
    installLink: "https://wallet.uniswap.org/",
  },
};

export const getAvailableWallets = (connectors: GetConnectorsReturnType) => {
  const available: Record<
    string,
    GardenSupportedEVMWallets & {
      connector: Connector | undefined;
    }
  > = {};
  const unavailable: Record<
    string,
    GardenSupportedEVMWallets & {
      connector: Connector | undefined;
    }
  > = {};

  Object.entries(GardenSupportedEVMWallets).forEach(([key, value]) => {
    const wallet = connectors.find((connector) => connector.id === value.id);
    if (wallet) {
      available[key] = {
        ...value,
        connector: wallet,
      };
    } else {
      unavailable[key] = {
        ...value,
        connector: undefined,
      };
    }
  });

  return {
    ...available,
    ...unavailable,
  };
};
