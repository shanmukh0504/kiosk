import {
  Chain,
  isAlpenSignet,
  isBitcoin,
  isLitecoin,
} from "@gardenfi/orderbook";
import { validateBTCAddress, validateLTCAddress } from "@gardenfi/core";
import { Environment } from "@gardenfi/utils";
import { network } from "../constants/constants";
/**
 * Hash map of chain type checkers to their respective validation functions
 */
const chainValidatorMap: Array<{
  check: (chain: Chain) => boolean;
  validator: (address: string, networkType: Environment) => boolean;
}> = [
  {
    check: (chain: Chain) => isBitcoin(chain) || isAlpenSignet(chain),
    validator: (address: string, networkType: Environment) =>
      validateBTCAddress(address, networkType),
  },
  {
    check: (chain: Chain) => isLitecoin(chain),
    validator: (address: string, networkType: Environment) =>
      validateLTCAddress(address, networkType),
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

  return validatorEntry.validator(address, network as unknown as Environment);
};
