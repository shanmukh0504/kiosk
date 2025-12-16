import { useEffect, useCallback, useRef } from "react";
import { useEVMWallet } from "./useEVMWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useStarknetWallet } from "./useStarknetWallet";
import { useSolanaWallet } from "./useSolanaWallet";
import { useSuiWallet } from "./useSuiWallet";
import { swapStore } from "../store/swapStore";
import { walletAddressStore } from "../store/walletAddressStore";
import { userProvidedAddressStore } from "../store/userProvidedAddressStore";
import { isEVM, isStarknet, isSolana, isSui, Chain } from "@gardenfi/orderbook";
import { isPureBitcoin } from "../utils/utils";

// Hook to manage wallet address storage (should only be called once)
// Only stores addresses from connected wallet providers
export const useAddressFillers = () => {
  const { inputAsset, outputAsset } = swapStore();
  const { setSource, setDestination, clearAddresses } = walletAddressStore();
  const { address: evmAddress } = useEVMWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { starknetAddress } = useStarknetWallet();
  const { solanaAddress } = useSolanaWallet();
  const { currentAccount } = useSuiWallet();

  const prevChainsRef = useRef<{
    inputChain?: Chain;
    outputChain?: Chain;
  }>({});

  const getWalletAddressForChain = useCallback(
    (chain: Chain): string | undefined => {
      if (isEVM(chain)) return evmAddress || undefined;
      if (isPureBitcoin(chain)) return btcAddress || undefined;
      if (isStarknet(chain)) return starknetAddress || undefined;
      if (isSolana(chain)) return solanaAddress || undefined;
      if (isSui(chain)) return currentAccount?.address || undefined;
      return undefined;
    },
    [evmAddress, btcAddress, starknetAddress, solanaAddress, currentAccount]
  );

  const {
    setSource: setUserSource,
    setDestination: setUserDestination,
    clearAddresses: clearUserAddresses,
  } = userProvidedAddressStore();

  // Store wallet addresses when available
  // Also clear user-provided addresses when chains change
  useEffect(() => {
    if (!inputAsset || !outputAsset) {
      clearAddresses();
      clearUserAddresses();
      prevChainsRef.current = {};
      return;
    }

    // Get wallet addresses for each chain
    const sourceWalletAddress = getWalletAddressForChain(inputAsset.chain);
    const destinationWalletAddress = getWalletAddressForChain(
      outputAsset.chain
    );

    // Check if asset chains have changed
    const inputChainChanged =
      prevChainsRef.current.inputChain !== inputAsset.chain;
    const outputChainChanged =
      prevChainsRef.current.outputChain !== outputAsset.chain;

    // Clear user-provided addresses when chains change
    // Also clear if asset type changed from Bitcoin to non-Bitcoin
    if (inputChainChanged) {
      setUserSource(undefined);
      setSource(sourceWalletAddress);
    } else {
      // Only update if wallet address is available (don't overwrite with undefined if already set)
      if (sourceWalletAddress !== undefined) {
        setSource(sourceWalletAddress);
      }
    }

    if (outputChainChanged) {
      setUserDestination(undefined);
      setDestination(destinationWalletAddress);
    } else {
      // Only update if wallet address is available (don't overwrite with undefined if already set)
      if (destinationWalletAddress !== undefined) {
        setDestination(destinationWalletAddress);
      }
    }

    // Update previous chains
    prevChainsRef.current = {
      inputChain: inputAsset.chain,
      outputChain: outputAsset.chain,
    };
  }, [
    inputAsset,
    outputAsset,
    getWalletAddressForChain,
    setSource,
    setDestination,
    clearAddresses,
    setUserSource,
    setUserDestination,
    clearUserAddresses,
  ]);
};
