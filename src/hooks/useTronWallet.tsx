import { useWallet, Wallet } from "@tronweb3/tronwallet-adapter-react-hooks";

export const useTronWallet = () => {
  const {
    connect: tronConnect,
    wallets,
    address,
    wallet,
    select,
    // autoConnect,
    // connected,
    // connecting,
    // signMessage,
    // signTransaction,
  } = useWallet();

  async function handleTronConnect(wallet: Wallet): Promise<void> {
    select(wallet.adapter.name);
    await tronConnect();
  }

  // useEffect(() => {
  //   if (status === "connected" && address && activeConnector) {
  //     localStorage.setItem(
  //       "starknetWalletStore",
  //       JSON.stringify({
  //         address: address,
  //         connector: activeConnector.name,
  //       })
  //     );
  //   }
  // }, [status, address, activeConnector]);

  // const { switchChainAsync, error } = useSwitchChain({
  //   params: {
  //     chainId:
  //       network === Network.MAINNET
  //         ? constants.StarknetChainId.SN_SEPOLIA
  //         : constants.StarknetChainId.SN_MAIN,
  //   },
  // });

  return {
    handleTronConnect,
    wallets,
    address,
    wallet,
  };
};
