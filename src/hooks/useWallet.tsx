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
import { isAlpenSignetChain, isPureBitcoin } from "../utils/utils";

// Hook to manage wallet address auto-population (should only be called once)
export const useWalletAddressManager = () => {
  const { inputAsset, outputAsset, isEditAddress, setIsEditAddress } =
    swapStore();
  const { setAddress } = walletAddressStore();
  const { address } = walletAddressStore();
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

  // Centralized helper: determines if an address should be auto-populated for a chain
  // Note: isEditing is only relevant for pure Bitcoin (other chains don't have edit option)
  const shouldAutoPopulateAddress = useCallback(
    (
      chain: Asset["chain"],
      walletAddress: string | undefined,
      isEditing: boolean
    ): string | undefined => {
      // Alpen Signet must NEVER auto-populate - always require manual input
      if (isAlpenSignetChain(chain)) {
        return undefined;
      }

      // Pure Bitcoin: auto-populate only if wallet is connected and not editing
      // (Bitcoin is the only chain with edit option)
      if (isPureBitcoin(chain)) {
        return walletAddress && !isEditing ? walletAddress : undefined;
      }

      // EVM: always auto-populate if wallet is connected (no edit option, must connect wallet)
      if (isEVM(chain)) {
        return walletAddress || undefined;
      }

      // Other chains (Starknet, Solana, Sui): auto-populate if wallet is connected
      // (no edit option, must connect wallet)
      return walletAddress || undefined;
    },
    []
  );

  // Auto-populate addresses from wallet providers
  useEffect(() => {
    if (!inputAsset || !outputAsset) {
      walletAddressStore.getState().clearAddresses();
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

    setAddress((prev) => {
      const newAddress: WalletAddress = { ...prev };

      // Handle source address
      if (inputChainChanged) {
        // Chain changed: clear and repopulate
        // Alpen Signet must always start with empty address
        if (isAlpenSignetChain(inputAsset.chain)) {
          newAddress.source = "";
        } else {
          const autoAddress = shouldAutoPopulateAddress(
            inputAsset.chain,
            sourceWalletAddress,
            isEditAddress.source
          );
          newAddress.source = autoAddress || "";
        }
      } else {
        // Chain didn't change: preserve user input, only update if appropriate
        // Alpen Signet: never auto-populate, preserve user input
        if (isAlpenSignetChain(inputAsset.chain)) {
          // Keep existing address (user input) or empty string
          newAddress.source = prev.source || "";
        } else if (isPureBitcoin(inputAsset.chain)) {
          // Pure Bitcoin: only respect edit mode (user can edit Bitcoin addresses)
          // Check if user has manually entered an address (different from wallet)
          const isManuallyEntered =
            prev.source &&
            prev.source !== sourceWalletAddress &&
            prev.source.length > 0;

          // Only auto-populate if not manually entered and not editing
          if (!isManuallyEntered && !isEditAddress.source) {
            const autoAddress = shouldAutoPopulateAddress(
              inputAsset.chain,
              sourceWalletAddress,
              isEditAddress.source
            );
            if (autoAddress) {
              newAddress.source = autoAddress;
            } else if (!prev.source) {
              newAddress.source = "";
            }
          }
        } else {
          // Other chains (EVM, Starknet, Solana, Sui): no edit option, always use wallet if connected
          const autoAddress = shouldAutoPopulateAddress(
            inputAsset.chain,
            sourceWalletAddress,
            false // isEditing not relevant for non-Bitcoin chains
          );
          if (autoAddress) {
            newAddress.source = autoAddress;
          } else if (!prev.source) {
            // Clear if no wallet address
            newAddress.source = "";
          }
        }
      }

      // Handle destination address
      if (outputChainChanged) {
        // Chain changed: clear and repopulate
        // Alpen Signet must always start with empty address
        if (isAlpenSignetChain(outputAsset.chain)) {
          newAddress.destination = "";
        } else {
          const autoAddress = shouldAutoPopulateAddress(
            outputAsset.chain,
            destinationWalletAddress,
            isEditAddress.destination
          );
          newAddress.destination = autoAddress || "";
        }
      } else {
        // Chain didn't change: preserve user input, only update if appropriate
        // Alpen Signet: never auto-populate, preserve user input
        if (isAlpenSignetChain(outputAsset.chain)) {
          // Keep existing address (user input) or empty string
          newAddress.destination = prev.destination || "";
        } else if (isPureBitcoin(outputAsset.chain)) {
          // Pure Bitcoin: only respect edit mode (user can edit Bitcoin addresses)
          // Check if user has manually entered an address (different from wallet)
          const isManuallyEntered =
            prev.destination &&
            prev.destination !== destinationWalletAddress &&
            prev.destination.length > 0;

          // Only auto-populate if not manually entered and not editing
          if (!isManuallyEntered && !isEditAddress.destination) {
            const autoAddress = shouldAutoPopulateAddress(
              outputAsset.chain,
              destinationWalletAddress,
              isEditAddress.destination
            );
            if (autoAddress) {
              newAddress.destination = autoAddress;
            }
          }
        } else {
          // Other chains (EVM, Starknet, Solana, Sui): no edit option, always use wallet if connected
          const autoAddress = shouldAutoPopulateAddress(
            outputAsset.chain,
            destinationWalletAddress,
            false // isEditing not relevant for non-Bitcoin chains
          );
          if (autoAddress) {
            newAddress.destination = autoAddress;
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
    shouldAutoPopulateAddress,
    evmAddress,
    btcAddress,
    starknetAddress,
    solanaAddress,
    currentAccount,
    setAddress,
  ]);

  // Track if user manually clicked edit (to prevent auto-closing)
  const manualEditRef = useRef<{
    source: boolean;
    destination: boolean;
  }>({ source: false, destination: false });

  // Auto-manage isEditAddress for Bitcoin addresses only
  // Simple logic:
  // - If BTC address exists from wallet → isEditAddress = false (show in bottom)
  // - If no address → isEditAddress = true (show input on top)
  // - If user clicked edit → isEditAddress = true (show input on top, respect manual edit)
  useEffect(() => {
    if (!inputAsset || !outputAsset) return;

    const currentEditState = swapStore.getState().isEditAddress;

    const getEditState = (
      addr: string,
      walletAddr: string | undefined,
      isBtc: boolean,
      current: boolean,
      isManuallySet: boolean
    ) => {
      // Only manage edit state for Bitcoin chains
      if (!isBtc) return false;

      // If user manually set edit mode, keep it true
      if (isManuallySet && current) return true;

      // If no address exists, show input (true)
      if (!addr) return true;

      // If address exists and matches wallet, don't show edit (false - show in bottom)
      // If address exists but doesn't match wallet, show edit (true - show input)
      return addr === walletAddr ? false : true;
    };

    const sourceIsPureBtc = isPureBitcoin(inputAsset.chain);
    const destIsPureBtc = isPureBitcoin(outputAsset.chain);
    const sourceWalletAddr = getWalletAddressForChain(inputAsset.chain);
    const destWalletAddr = getWalletAddressForChain(outputAsset.chain);

    const newSource = getEditState(
      address.source,
      sourceIsPureBtc ? sourceWalletAddr : undefined,
      sourceIsPureBtc,
      currentEditState.source,
      manualEditRef.current.source
    );

    const newDest = getEditState(
      address.destination,
      destIsPureBtc ? destWalletAddr : undefined,
      destIsPureBtc,
      currentEditState.destination,
      manualEditRef.current.destination
    );

    // Only update if state actually changed
    if (
      newSource !== currentEditState.source ||
      newDest !== currentEditState.destination
    ) {
      setIsEditAddress({ source: newSource, destination: newDest });
    }
  }, [
    inputAsset,
    outputAsset,
    address.source,
    address.destination,
    getWalletAddressForChain,
    btcAddress,
    setIsEditAddress,
  ]);

  // Track previous state to detect manual edits
  const prevEditStateRef = useRef(swapStore.getState().isEditAddress);

  // Detect manual edit clicks (transition from false to true)
  useEffect(() => {
    const currentState = swapStore.getState().isEditAddress;
    const prevState = prevEditStateRef.current;

    // If user manually opened edit (false -> true), mark as manual
    if (!prevState.source && currentState.source) {
      manualEditRef.current.source = true;
    }
    if (!prevState.destination && currentState.destination) {
      manualEditRef.current.destination = true;
    }

    // Clear manual flag if set back to false
    if (!currentState.source) {
      manualEditRef.current.source = false;
    }
    if (!currentState.destination) {
      manualEditRef.current.destination = false;
    }

    prevEditStateRef.current = currentState;
  }, [isEditAddress.source, isEditAddress.destination]);
};
