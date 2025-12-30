import { useEffect } from "react";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useEVMWallet } from "./useEVMWallet";
import { useStarknetWallet } from "./useStarknetWallet";
import { useSolanaWallet } from "./useSolanaWallet";
import { useSuiWallet } from "./useSuiWallet";
import { useTronWallet } from "./useTronWallet";
import { balanceStore } from "../store/balanceStore";
import { ChainType } from "../utils/balanceSubscription";
import { assetInfoStore } from "../store/assetInfoStore";

export const useBalance = () => {
  const { connectBalanceStream, disconnectBalanceStream } = balanceStore();
  const { assets, fetchAndSetFiatValues } = assetInfoStore();

  const { account: btcAddress } = useBitcoinWallet();
  const { address } = useEVMWallet();
  const { starknetAddress } = useStarknetWallet();
  const { solanaAnchorProvider } = useSolanaWallet();
  const { currentAccount } = useSuiWallet();
  const { tronAddress } = useTronWallet();

  useEffect(() => {
    if (!assets) return;

    fetchAndSetFiatValues();

    if (address) {
      connectBalanceStream(ChainType.EVM, address);
    }
    if (btcAddress) {
      connectBalanceStream(ChainType.BITCOIN, btcAddress);
    }
    if (starknetAddress) {
      connectBalanceStream(ChainType.STARKNET, starknetAddress);
    }
    if (solanaAnchorProvider) {
      connectBalanceStream(
        ChainType.SOLANA,
        solanaAnchorProvider.publicKey.toString()
      );
    }
    if (currentAccount) {
      connectBalanceStream(ChainType.SUI, currentAccount.address);
    }
    if (tronAddress) {
      connectBalanceStream(ChainType.TRON, tronAddress);
    }

    return () => {
      if (address) {
        disconnectBalanceStream(ChainType.EVM, address);
      }
      if (btcAddress) {
        disconnectBalanceStream(ChainType.BITCOIN, btcAddress);
      }
      if (starknetAddress) {
        disconnectBalanceStream(ChainType.STARKNET, starknetAddress);
      }
      if (solanaAnchorProvider) {
        disconnectBalanceStream(
          ChainType.SOLANA,
          solanaAnchorProvider.publicKey.toString()
        );
      }
      if (currentAccount) {
        disconnectBalanceStream(ChainType.SUI, currentAccount.address);
      }
      if (tronAddress) {
        disconnectBalanceStream(ChainType.TRON, tronAddress);
      }
    };
  }, [
    assets,
    address,
    btcAddress,
    starknetAddress,
    solanaAnchorProvider,
    currentAccount,
    tronAddress,
    connectBalanceStream,
    disconnectBalanceStream,
    fetchAndSetFiatValues,
  ]);
};
