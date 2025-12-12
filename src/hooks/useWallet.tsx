import { useEffect, useCallback, useRef } from "react";
import { useEVMWallet } from "./useEVMWallet";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { useStarknetWallet } from "./useStarknetWallet";
import { useSolanaWallet } from "./useSolanaWallet";
import { useSuiWallet } from "./useSuiWallet";
import { swapStore } from "../store/swapStore";
import { walletAddressStore, WalletAddress } from "../store/walletAddressStore";
import {
  isEVM,
  isBitcoin,
  isStarknet,
  isSolana,
  isSui,
  Asset,
} from "@gardenfi/orderbook";

// Hook to manage wallet address auto-population (should only be called once)
export const useWalletAddressManager = () => {
  const { inputAsset, outputAsset, isEditAddress } = swapStore();
  const setAddress = walletAddressStore((state) => state.setAddress);
  const { address: evmAddress } = useEVMWallet();
  const { account: btcAddress } = useBitcoinWallet();
  const { starknetAddress } = useStarknetWallet();
  const { solanaAddress } = useSolanaWallet();
  const { currentAccount } = useSuiWallet();

  // Track previous asset chains to detect changes
  const prevChainsRef = useRef<{
    inputChain?: Asset["chain"];
    outputChain?: Asset["chain"];
  }>({});

  // Get wallet address for a given chain
  const getWalletAddressForChain = useCallback(
    (chain: Asset["chain"]): string | undefined => {
      if (isEVM(chain)) return evmAddress || undefined;
      if (isBitcoin(chain)) return btcAddress || undefined;
      if (isStarknet(chain)) return starknetAddress || undefined;
      if (isSolana(chain)) return solanaAddress || undefined;
      if (isSui(chain)) return currentAccount?.address || undefined;
      return undefined;
    },
    [evmAddress, btcAddress, starknetAddress, solanaAddress, currentAccount]
  );

  // Auto-populate addresses from wallet providers
  useEffect(() => {
    if (!inputAsset || !outputAsset) {
      walletAddressStore.getState().clearAddresses();
      prevChainsRef.current = {};
      return;
    }

    const sourceWalletAddress = getWalletAddressForChain(inputAsset.chain);
    const destinationWalletAddress = getWalletAddressForChain(
      outputAsset.chain
    );

    // Check if asset chains have changed
    const inputChainChanged =
      prevChainsRef.current.inputChain !== inputAsset.chain;
    const outputChainChanged =
      prevChainsRef.current.outputChain !== outputAsset.chain;

    setAddress((prev) => {
      const newAddress: WalletAddress = { ...prev };

      // If input chain changed, clear and repopulate source address
      if (inputChainChanged) {
        newAddress.source = "";
        // For EVM chains: always set if wallet is connected
        if (isEVM(inputAsset.chain) && sourceWalletAddress) {
          newAddress.source = sourceWalletAddress;
        }
        // For Bitcoin: set if wallet is connected and not editing
        else if (isBitcoin(inputAsset.chain)) {
          if (!isEditAddress.source && sourceWalletAddress) {
            newAddress.source = sourceWalletAddress;
          }
        }
        // For other chains (Starknet, Solana, Sui): set if wallet is connected
        else if (sourceWalletAddress) {
          newAddress.source = sourceWalletAddress;
        }
      } else {
        // Chain didn't change, only update if needed and not manually edited
        // For EVM chains: always set if wallet is connected (unless user is editing)
        if (isEVM(inputAsset.chain) && sourceWalletAddress) {
          if (!isEditAddress.source || !prev.source) {
            newAddress.source = sourceWalletAddress;
          }
        }
        // For Bitcoin: only set if not in edit mode
        else if (isBitcoin(inputAsset.chain)) {
          if (!isEditAddress.source && sourceWalletAddress) {
            newAddress.source = sourceWalletAddress;
          }
          // If editing, keep user's input
        }
        // For other chains: set if wallet is connected (unless user is editing)
        else if (sourceWalletAddress) {
          if (!isEditAddress.source || !prev.source) {
            newAddress.source = sourceWalletAddress;
          }
        }
      }

      // If output chain changed, clear and repopulate destination address
      if (outputChainChanged) {
        newAddress.destination = "";
        if (isEVM(outputAsset.chain) && destinationWalletAddress) {
          newAddress.destination = destinationWalletAddress;
        } else if (isBitcoin(outputAsset.chain)) {
          if (!isEditAddress.destination && destinationWalletAddress) {
            newAddress.destination = destinationWalletAddress;
          }
        } else if (destinationWalletAddress) {
          newAddress.destination = destinationWalletAddress;
        }
      } else {
        // Chain didn't change, only update if needed and not manually edited
        // IMPORTANT: Don't overwrite if user has manually entered an address
        // Check if the current address is a manually entered one (not from wallet)
        const isManuallyEntered =
          prev.destination &&
          prev.destination !== destinationWalletAddress &&
          prev.destination.length > 0;

        if (isEVM(outputAsset.chain) && destinationWalletAddress) {
          // Only set if not manually entered and not editing
          if (
            !isManuallyEntered &&
            (!isEditAddress.destination || !prev.destination)
          ) {
            newAddress.destination = destinationWalletAddress;
          }
        } else if (isBitcoin(outputAsset.chain)) {
          // For Bitcoin, only auto-populate if not editing and address is empty
          // NEVER overwrite if user has manually entered something
          if (
            !isManuallyEntered &&
            !isEditAddress.destination &&
            destinationWalletAddress
          ) {
            newAddress.destination = destinationWalletAddress;
          }
          // If user has typed something, keep it (don't change)
        } else if (destinationWalletAddress) {
          if (
            !isManuallyEntered &&
            (!isEditAddress.destination || !prev.destination)
          ) {
            newAddress.destination = destinationWalletAddress;
          }
        }
      }

      return newAddress;
    });

    // Update previous chains
    prevChainsRef.current = {
      inputChain: inputAsset.chain,
      outputChain: outputAsset.chain,
    };
  }, [
    inputAsset,
    outputAsset,
    isEditAddress.source,
    isEditAddress.destination,
    getWalletAddressForChain,
    evmAddress,
    btcAddress,
    starknetAddress,
    solanaAddress,
    currentAccount,
    setAddress,
  ]);
};

// Simple hook to access the store (components should use this)
export const useWallet = () => {
  const address = walletAddressStore((state) => state.address);
  const setAddress = walletAddressStore((state) => state.setAddress);
  return { address, setAddress };
};
