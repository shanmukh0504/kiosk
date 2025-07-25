import { useEffect, useMemo } from "react";
import { assetInfoStore } from "../store/assetInfoStore";
import { swapStore } from "../store/swapStore";
import {
  isBitcoin,
  isEvmNativeToken,
  isSolanaNativeToken,
} from "@gardenfi/orderbook";
import { getOrderPair } from "../utils/utils";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import { BitcoinNetwork, BitcoinProvider } from "@gardenfi/core";
import { network } from "../constants/constants";
import { getSpendableBalance } from "../utils/getmaxBtc";
import * as Sentry from "@sentry/react";

export const useNativeMaxBalances = () => {
  const { balances } = assetInfoStore();
  const { inputAsset } = swapStore();
  const { account: btcAddress } = useBitcoinWallet();

  const balance =
    inputAsset &&
    balances[getOrderPair(inputAsset.chain, inputAsset.tokenAddress)];

  const maxSpendableNativeBalances: Record<string, number> = useMemo(
    () => ({}),
    []
  );

  useEffect(() => {
    if (!inputAsset || !balance) return;
    // console.log("balance :", balance);

    //EVM gas
    if (isEvmNativeToken(inputAsset.chain, inputAsset.tokenAddress)) {
      // TODO: fetch gas and subtract from balance
    }

    // BTC gas
    if (isBitcoin(inputAsset.chain) && btcAddress) {
      // TODO: fetch gas and subtract from balance
      const calculateInitialSpendableBalance = async () => {
        const provider = new BitcoinProvider(
          network === "mainnet"
            ? BitcoinNetwork.Mainnet
            : BitcoinNetwork.Testnet
        );
        try {
          const balanceInSats = Number(balance);
          const feeRate = await provider.getFeeRates();
          const utxos = await provider.getUTXOs(btcAddress, balanceInSats);

          const spendable = await getSpendableBalance(
            btcAddress,
            balanceInSats,
            utxos.length,
            feeRate.fastestFee
          );
          if (!spendable.ok) {
            Sentry.captureException(spendable.error);
            console.error(
              "Error calculating initial spendable balance:",
              spendable.error
            );
            return;
          }

          maxSpendableNativeBalances[
            getOrderPair(inputAsset.chain, inputAsset.tokenAddress)
          ] = spendable.val;
        } catch (error) {
          Sentry.captureException(error);
          console.error("Error calculating initial spendable balance:", error);
          maxSpendableNativeBalances[
            getOrderPair(inputAsset.chain, inputAsset.tokenAddress)
          ] = Math.max(0, Number(balance));
        }
      };

      calculateInitialSpendableBalance();
    }

    // SOL gas
    if (isSolanaNativeToken(inputAsset.chain, inputAsset.tokenAddress)) {
      //
      const gas = 0.00380608;
      maxSpendableNativeBalances[
        getOrderPair(inputAsset.chain, inputAsset.tokenAddress)
      ] = Math.max(0, Number((Number(balance) - gas).toFixed(8)));
    }
  }, [inputAsset, balance, btcAddress, maxSpendableNativeBalances]);

  return maxSpendableNativeBalances;
};
