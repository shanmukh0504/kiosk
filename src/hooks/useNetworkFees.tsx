import { useEffect } from "react";
import { constructOrderPair } from "@gardenfi/core";
import { calculateBitcoinNetworkFees } from "../utils/getNetworkFees";
import { formatAmount } from "../utils/utils";
import { Asset, isBitcoin, isSui } from "@gardenfi/orderbook";
import { assetInfoStore } from "../store/assetInfoStore";
import { swapStore } from "../store/swapStore";
import { getBitcoinNetwork, SUI_CONFIG } from "../constants/constants";
import logger from "../utils/logger";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { network } from "../constants/constants";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { DigestKey } from "@gardenfi/utils";

export const useNetworkFees = () => {
  const { strategies } = assetInfoStore();
  const {
    setNetworkFees,
    setIsNetworkFeesLoading,
    inputAsset,
    outputAsset,
    inputAmount,
  } = swapStore();

  const bitcoin_network = getBitcoinNetwork();

  const getSuiGasFee = async (address: string, asset: Asset) => {
    if (!isSui(asset.chain)) return 0;
    const suiRpcUrl = getFullnodeUrl(network);
    try {
      const client = new SuiClient({ url: suiRpcUrl });

      const amount = BigInt(inputAmount);
      const registryId = asset?.tokenAddress;
      const solverAddress =
        "0x6e416201f2e6547293f5cd52d4a420bf26ceda4d3ef01283ab720d9fa927b5c2";
      const secretHash = DigestKey.generateRandom();

      const tx = new Transaction();
      tx.setSender(address);

      const [coin] = tx.splitCoins(tx.gas, [amount]);

      // Create the move call for the `initiate` method
      tx.moveCall({
        target: `${SUI_CONFIG[network].packageId}::${
          SUI_CONFIG[network].moduleName
        }::initiate`,
        typeArguments: [asset?.tokenAddress as string],
        arguments: [
          tx.object(registryId as string),
          tx.pure.address(address),
          tx.pure.address(solverAddress as string),
          tx.pure.vector(
            "u8",
            Buffer.from(secretHash.val?.digestKey as string, "hex")
          ),
          tx.pure.u64(amount),
          tx.pure.u256(7200000),
          tx.pure.vector("u8", Buffer.from("")),
          coin,
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });

      // Build and dry run the transaction
      const data = await tx.build({ client });
      const dryRunResult = await client.dryRunTransactionBlock({
        transactionBlock: data,
      });

      // Extract gas usage from dry-run result
      const gasObject = dryRunResult.effects.gasUsed;

      // Calculate total gas cost
      const totalGasCost =
        Number(gasObject.computationCost) +
        Number(gasObject.storageCost) +
        Number(gasObject.nonRefundableStorageFee);

      // Return the total gas fee
      return totalGasCost;
    } catch (error) {
      console.error("Error fetching Sui gas fee:", error);
      return 0;
    }
  };

  inputAsset &&
    isSui(inputAsset.chain) &&
    getSuiGasFee(
      "0xd001293f1f1f179ef1b4e34db109d008e62fb7e9a0fe98b74b001ec89578c072",
      inputAsset
    );

  useEffect(() => {
    if (!inputAsset || !outputAsset || !strategies.val) return;

    const fetchNetworkFees = async () => {
      if (!strategies.val) return;

      setIsNetworkFeesLoading(true);
      try {
        const strategy =
          strategies.val[
            constructOrderPair(
              inputAsset.chain,
              inputAsset.atomicSwapAddress,
              outputAsset.chain,
              outputAsset.atomicSwapAddress
            )
          ];
        if (isBitcoin(inputAsset.chain) || isBitcoin(outputAsset.chain)) {
          const fees = await calculateBitcoinNetworkFees(
            bitcoin_network,
            isBitcoin(inputAsset.chain) ? inputAsset : outputAsset
          );
          setNetworkFees(formatAmount(fees + strategy.fixed_fee, 0));
        } else {
          setNetworkFees(formatAmount(strategy.fixed_fee, 0));
        }
      } catch (error) {
        logger.error("failed to fetch network fees ❌", error);
        setNetworkFees(0);
      } finally {
        setIsNetworkFeesLoading(false);
      }
    };
    fetchNetworkFees();

    const intervalId = setInterval(fetchNetworkFees, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [bitcoin_network, inputAsset, outputAsset, strategies.val]);
};
