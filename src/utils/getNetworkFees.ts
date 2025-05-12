import { BitcoinProvider, BitcoinNetwork } from "@catalogfi/wallets";
import { BTC } from "../store/swapStore";
import axios from "axios";
import { API } from "../constants/api";
import { Chains } from "@gardenfi/orderbook";

type AssetEntry = {
  chain: string;
  htlc_address: string;
  token_price: number;
};

const getBTCPrice = async (): Promise<number> => {
  const response = await axios.get(API().fiatValues.toString(), {
    timeout: 2000,
  });
  const data = response.data;
  const btcEntry = data.result.find(
    (entry: AssetEntry) => entry.chain === Chains.bitcoin
  );
  return btcEntry?.token_price || 0;
};

export const calculateNetworkFees = async (
  network: BitcoinNetwork
): Promise<number> => {
  const btcPrice = await getBTCPrice();
  const provider = new BitcoinProvider(network);

  const feeRate = await provider.getFeeRates();

  const fees = Math.ceil(feeRate.hourFee * 142); // in sats
  const feesInBTC = fees / 10 ** BTC.decimals;

  return feesInBTC * btcPrice;
};
