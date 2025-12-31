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

export const useTokenBalances = () => {
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
  }, [assets, fetchAndSetFiatValues]);

  useEffect(() => {
    if (!assets || !address) return;
    connectBalanceStream(ChainType.EVM, address);
    return () => {
      disconnectBalanceStream(ChainType.EVM, address);
    };
  }, [assets, address, connectBalanceStream, disconnectBalanceStream]);

  useEffect(() => {
    if (!assets || !btcAddress) return;
    connectBalanceStream(ChainType.BITCOIN, btcAddress);
    return () => {
      disconnectBalanceStream(ChainType.BITCOIN, btcAddress);
    };
  }, [assets, btcAddress, connectBalanceStream, disconnectBalanceStream]);

  useEffect(() => {
    if (!assets || !starknetAddress) return;
    connectBalanceStream(ChainType.STARKNET, starknetAddress);
    return () => {
      disconnectBalanceStream(ChainType.STARKNET, starknetAddress);
    };
  }, [assets, starknetAddress, connectBalanceStream, disconnectBalanceStream]);

  useEffect(() => {
    if (!assets || !solanaAnchorProvider) return;
    const solanaAddress = solanaAnchorProvider.publicKey.toString();
    connectBalanceStream(ChainType.SOLANA, solanaAddress);
    return () => {
      disconnectBalanceStream(ChainType.SOLANA, solanaAddress);
    };
  }, [
    assets,
    solanaAnchorProvider,
    connectBalanceStream,
    disconnectBalanceStream,
  ]);

  useEffect(() => {
    if (!assets || !currentAccount) return;
    connectBalanceStream(ChainType.SUI, currentAccount.address);
    return () => {
      disconnectBalanceStream(ChainType.SUI, currentAccount.address);
    };
  }, [assets, currentAccount, connectBalanceStream, disconnectBalanceStream]);

  useEffect(() => {
    if (!assets || !tronAddress) return;
    connectBalanceStream(ChainType.TRON, tronAddress);
    return () => {
      disconnectBalanceStream(ChainType.TRON, tronAddress);
    };
  }, [assets, tronAddress, connectBalanceStream, disconnectBalanceStream]);
};
