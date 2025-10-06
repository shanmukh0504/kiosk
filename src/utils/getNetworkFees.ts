import { BitcoinProvider } from "@gardenfi/core";
import { BTC } from "../store/swapStore";
import { isBitcoin, Asset } from "@gardenfi/orderbook";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { network } from "../constants/constants";
import { Transaction } from "@mysten/sui/transactions";
import { getAssetChainHTLCAddressPair } from "./utils";
import BigNumber from "bignumber.js";
import { Network } from "@gardenfi/utils";
import { assetInfoStore } from "../store/assetInfoStore";

const getBTCPrice = async (): Promise<number> => {
  try {
    const { assets, allAssets } = assetInfoStore.getState();
    const source = assets ?? allAssets;
    if (source) {
      const values = Object.values(source);
      const btcNative = values.find(
        (a) =>
          isBitcoin(a.chain) &&
          (a.symbol?.toUpperCase() === "BTC" ||
            a.asset?.toLowerCase().endsWith(":btc"))
      );
      if (btcNative?.price && Number.isFinite(btcNative.price)) {
        return btcNative.price;
      }

      const anyBtcOnBitcoin = values.find((a) => isBitcoin(a.chain) && a.price);
      if (anyBtcOnBitcoin?.price && Number.isFinite(anyBtcOnBitcoin.price)) {
        return anyBtcOnBitcoin.price;
      }
    }
  } catch (err) {
    console.log("Error in getBTCPrice:", err);
  }
  return 0;
};

export const calculateBitcoinNetworkFees = async (
  network: Network,
  asset?: Asset
): Promise<number> => {
  if (asset && !isBitcoin(asset.chain)) return 0;

  const btcPrice = await getBTCPrice();
  const provider = new BitcoinProvider(network);

  const feeRate = await provider.getFeeRates();

  const fees = Math.ceil(feeRate.fastestFee * 142); // in sats
  const feesInBTC = fees / 10 ** BTC.decimals;
  return feesInBTC * btcPrice;
};

export const getSuiNetworkFee = async (
  address: string,
  asset: Asset,
  inputAmount: string,
  fiatData: Record<string, number | undefined>
) => {
  const BUFFER_FEE_IN_MIST = 5_000_000;
  try {
    const amount = new BigNumber(inputAmount)
      .multipliedBy(10 ** asset.decimals)
      .toFixed(0);

    const totalGasCost = await getSuiTotalGasFee(address, amount);

    const networkFee = BigNumber(BUFFER_FEE_IN_MIST + totalGasCost)
      .dividedBy(10 ** asset.decimals)
      .toNumber();

    const tokenPriceUsd =
      (fiatData && fiatData[getAssetChainHTLCAddressPair(asset)]) ?? 0;
    return networkFee * tokenPriceUsd;
  } catch (error) {
    console.log(error);
  }
  return 0;
};

export const getSuiTotalGasFee = async (address: string, amount: string) => {
  const client = new SuiClient({ url: getFullnodeUrl(network) });
  const tx = new Transaction();
  tx.setSender(address);

  const [coin] = tx.splitCoins(tx.gas, [BigInt(amount)]);

  tx.transferObjects([coin], address);
  const data = await tx.build({ client });
  const dryRunResult = await client.dryRunTransactionBlock({
    transactionBlock: data,
  });
  const gasObject = dryRunResult.effects.gasUsed;
  const totalGasCost =
    Number(gasObject.computationCost) +
    Number(gasObject.storageCost) +
    Number(gasObject.nonRefundableStorageFee);
  return totalGasCost;
};
