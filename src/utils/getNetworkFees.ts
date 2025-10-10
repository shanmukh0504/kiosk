import { BitcoinProvider, BitcoinNetwork } from "@gardenfi/core";
import { BTC } from "../store/swapStore";
import axios from "axios";
import { API } from "../constants/api";
import { isBitcoin, Asset, Chains } from "@gardenfi/orderbook";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { network } from "../constants/constants";
import { Transaction } from "@mysten/sui/transactions";
import { getAssetChainHTLCAddressPair } from "./utils";
import BigNumber from "bignumber.js";

type AssetEntry = {
  chain: string;
  htlc_address: string;
  token_price: number;
};

const getBTCPrice = async (): Promise<number> => {
  const response = await axios.get(API().quote.fiatValues.toString(), {
    timeout: 2000,
  });
  const data = response.data;
  const btcEntry = data.result.find((entry: AssetEntry) =>
    entry.chain.includes(Chains.bitcoin)
  );
  return btcEntry?.token_price || 0;
};

export const calculateBitcoinNetworkFees = async (
  network: BitcoinNetwork,
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
