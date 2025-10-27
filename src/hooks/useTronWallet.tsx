import { useWallet, Wallet } from "@tronweb3/tronwallet-adapter-react-hooks";

export const useTronWallet = () => {
  const {
    connect: tronConnect,
    wallets,
    address,
    wallet,
    select,
    // autoConnect,
    connected,
    disconnect,
  } = useWallet();

  async function handleTronConnect(wallet: Wallet): Promise<void> {
    select(wallet.adapter.name);
    await tronConnect();
  }

  return {
    handleTronConnect,
    tronConnected: connected,
    tronDisconnect: disconnect,
    wallets,
    address,
    wallet,
  };
};
