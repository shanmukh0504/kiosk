import { useEffect, useCallback, useRef } from "react";
import { useEVMWallet } from "./useEVMWallet";
import {
  useBitcoinWallet,
  useLitecoinWallet,
} from "@gardenfi/wallet-connectors";
import { useStarknetWallet } from "./useStarknetWallet";
import { useSolanaWallet } from "./useSolanaWallet";
import { useSuiWallet } from "./useSuiWallet";
import { swapStore } from "../store/swapStore";
import {
  isEVM,
  isStarknet,
  isSolana,
  isSui,
  Chain,
  isLitecoin,
  isTron,
  isBitcoin,
} from "@gardenfi/orderbook";
import { useTronWallet } from "./useTronWallet";

// Hook to manage wallet address storage (should only be called once)
// Only stores addresses from connected wallet providers
export const useAddressFillers = () => {
  const {
    inputAsset,
    outputAsset,
    setSourceAddress,
    setDestinationAddress,
    clearAddresses,
    setUserProvidedAddress,
    clearUserProvidedAddress,
  } = swapStore();
  const { address: evmAddress } = useEVMWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { account: ltcAddress } = useLitecoinWallet();
  const { starknetAddress } = useStarknetWallet();
  const { solanaAddress } = useSolanaWallet();
  const { tronAddress } = useTronWallet();
  const { currentAccount } = useSuiWallet();

  const prevChainsRef = useRef<{
    inputChain?: Chain;
    outputChain?: Chain;
  }>({});

  const getWalletAddressForChain = useCallback(
    (chain: Chain): string | undefined => {
      if (isEVM(chain)) return evmAddress || undefined;
      if (isLitecoin(chain)) return ltcAddress || undefined;
      if (isBitcoin(chain)) return btcAddress || undefined;
      if (isStarknet(chain)) return starknetAddress || undefined;
      if (isSolana(chain)) return solanaAddress || undefined;
      if (isSui(chain)) return currentAccount?.address || undefined;
      if (isTron(chain)) return tronAddress || undefined;
      return undefined;
    },
    [
      evmAddress,
      btcAddress,
      starknetAddress,
      solanaAddress,
      currentAccount,
      ltcAddress,
    ]
  );

  // Store wallet addresses when available
  // Also clear user-provided addresses when chains change
  useEffect(() => {
    if (!inputAsset || !outputAsset) {
      clearAddresses();
      clearUserProvidedAddress();
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
      setUserProvidedAddress({ source: undefined });
      setSourceAddress(sourceWalletAddress);
    } else {
      // Only update if wallet address is available (don't overwrite with undefined if already set)
      if (sourceWalletAddress !== undefined) {
        setSourceAddress(sourceWalletAddress);
      }
    }

    if (outputChainChanged) {
      setUserProvidedAddress({ destination: undefined });
      setDestinationAddress(destinationWalletAddress);
    } else {
      // Only update if wallet address is available (don't overwrite with undefined if already set)
      if (destinationWalletAddress !== undefined) {
        setDestinationAddress(destinationWalletAddress);
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
    setSourceAddress,
    setDestinationAddress,
    clearAddresses,
    setUserProvidedAddress,
    clearUserProvidedAddress,
  ]);
};
