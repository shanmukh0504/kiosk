import { Chain, isBitcoin, isLitecoin } from "@gardenfi/orderbook";
import { validateBTCAddress, validateLTCAddress } from "@gardenfi/core";
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

const validateLitecoinAddress: AddressValidator = (address: string) => {
  if (!address) return false;

  return validateLTCAddress(address, network as unknown as Environment);
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
    check: (chain: Chain) => isLitecoin(chain),
    validator: validateLitecoinAddress,
  },
];

/**
 * Validates an address based on the chain type
 * @param address - The address to validate
 * @param chain - The chain type to validate against
 * @returns true if the address is valid for the given chain, false otherwise
 */
export const validateAddress = (
  address: string | undefined,
  chain?: Chain
): boolean => {
  if (!chain || !address) return false;

  // Find the appropriate validator for the chain
  const validatorEntry = chainValidatorMap.find((entry) => entry.check(chain));

  if (!validatorEntry) {
    // If no validator found for the chain, consider it valid (unknown chain types)
    return true;
  }

  return validatorEntry.validator(address);
};
