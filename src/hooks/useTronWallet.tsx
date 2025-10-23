// import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

// export const useStarknetWallet = () => {
//   const {
//     connect: tronConnect,
//     wallets,
//     address,
//     wallet,
//     select,
//     autoConnect,
//     connected,
//     connecting,
//     signMessage,
//     signTransaction,
//   } = useWallet();

//   // useEffect(() => {
//   //   if (status === "connected" && address && activeConnector) {
//   //     localStorage.setItem(
//   //       "starknetWalletStore",
//   //       JSON.stringify({
//   //         address: address,
//   //         connector: activeConnector.name,
//   //       })
//   //     );
//   //   }
//   // }, [status, address, activeConnector]);

//   // const { switchChainAsync, error } = useSwitchChain({
//   //   params: {
//   //     chainId:
//   //       network === Network.MAINNET
//   //         ? constants.StarknetChainId.SN_SEPOLIA
//   //         : constants.StarknetChainId.SN_MAIN,
//   //   },
//   // });

//   return {
//     tronConnect,
//     wallets,
//     address,
//     wallet,
//   };
// };
