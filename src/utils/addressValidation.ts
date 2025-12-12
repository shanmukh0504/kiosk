import {
  Chain,
  isBitcoin,
  isEVM,
  isSolana,
  isStarknet,
  isSui,
} from "@gardenfi/orderbook";
import { validateBTCAddress } from "@gardenfi/core";
import { Environment } from "@gardenfi/utils";
import { network } from "../constants/constants";
import { isAlpenSignetChain } from "./utils";

type AddressValidator = (address: string) => boolean;

/**
 * Validates a Bitcoin address
 */
const validateBitcoinAddress: AddressValidator = (address: string) => {
  if (!address) return false;
  return validateBTCAddress(address, network as unknown as Environment);
};

/**
 * Validates an EVM address (Ethereum, Base, Arbitrum, etc.)
 */
const validateEVMAddress: AddressValidator = (address: string) => {
  if (!address) return false;
  // EVM addresses are 42 characters (0x + 40 hex chars)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validates a Solana address
 */
const validateSolanaAddress: AddressValidator = (address: string) => {
  if (!address) return false;
  // Solana addresses are base58 encoded, typically 32-44 characters
  // Basic validation: base58 characters, reasonable length
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

/**
 * Validates a Starknet address
 */
const validateStarknetAddress: AddressValidator = (address: string) => {
  if (!address) return false;
  // Starknet addresses are hex strings, typically 66 characters (0x + 64 hex chars)
  return /^0x[a-fA-F0-9]{63,64}$/.test(address);
};

/**
 * Validates a Sui address
 */
const validateSuiAddress: AddressValidator = (address: string) => {
  if (!address) return false;
  // Sui addresses are base58 encoded, typically 32-44 characters
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
};

/**
 * Hash map of chain type checkers to their respective validation functions
 */
const chainValidatorMap: Array<{
  check: (chain: Chain) => boolean;
  validator: AddressValidator;
}> = [
  {
    check: (chain: Chain) => isBitcoin(chain) || isAlpenSignetChain(chain),
    validator: validateBitcoinAddress,
  },
  {
    check: (chain: Chain) => isEVM(chain),
    validator: validateEVMAddress,
  },
  {
    check: (chain: Chain) => isSolana(chain),
    validator: validateSolanaAddress,
  },
  {
    check: (chain: Chain) => isStarknet(chain),
    validator: validateStarknetAddress,
  },
  {
    check: (chain: Chain) => isSui(chain),
    validator: validateSuiAddress,
  },
];

/**
 * Validates an address based on the chain type
 * @param address - The address to validate
 * @param chain - The chain type to validate against
 * @returns true if the address is valid for the given chain, false otherwise
 */
export const validateAddress = (address: string, chain?: Chain): boolean => {
  if (!chain || !address) return true; // If no chain or address, consider valid (no validation needed)

  // Find the appropriate validator for the chain
  const validatorEntry = chainValidatorMap.find((entry) => entry.check(chain));

  if (!validatorEntry) {
    // If no validator found for the chain, consider it valid (unknown chain types)
    return true;
  }

  return validatorEntry.validator(address);
};
