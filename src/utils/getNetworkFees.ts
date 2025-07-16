import { BitcoinProvider, BitcoinNetwork } from "@gardenfi/core";
import { BTC } from "../store/swapStore";
import axios from "axios";
import { API } from "../constants/api";
import { Chains, isBitcoin, Asset } from "@gardenfi/orderbook";

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
  const btcEntry = data.result.find(
    (entry: AssetEntry) => entry.chain === Chains.bitcoin
  );
  return btcEntry?.token_price || 0;
};

export const calculateNetworkFees = async (
  network: BitcoinNetwork,
  outputAsset?: Asset
): Promise<number> => {
  const btcPrice = await getBTCPrice();
  const provider = new BitcoinProvider(network);

  if (outputAsset && !isBitcoin(outputAsset.chain)) return 0;
  const feeRate = await provider.getFeeRates();

  const fees = Math.ceil(feeRate.hourFee * 142); // in sats
  const feesInBTC = fees / 10 ** BTC.decimals;

  return feesInBTC * btcPrice;
};
