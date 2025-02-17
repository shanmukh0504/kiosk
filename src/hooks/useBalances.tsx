import { useEffect, useMemo } from "react";
import { Asset, isBitcoin } from "@gardenfi/orderbook";
import { evmToViemChainMap } from "@gardenfi/core";
import { useEVMWallet } from "./useEVMWallet";
import { getTokenBalance } from "../utils/getTokenBalance";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import BigNumber from "bignumber.js";
import { balanceStore } from "../store/balanceStore";

export const useBalances = (asset: Asset | undefined) => {
  const { balances, setBalance, clearBalances } = balanceStore();
  const { address } = useEVMWallet();
  const { provider } = useBitcoinWallet();

  const tokenBalance = useMemo(
    () => balances[`${asset?.chain}_${asset?.tokenAddress.toLowerCase()}`],
    [balances, asset]
  );

  useEffect(() => {
    if (!asset || !address) return;

    const fetchBalance = async () => {
      if (isBitcoin(asset.chain)) {
        if (!provider) return;
        const balance = await provider.getBalance();
        if (balance.error || !balance.val) return;

        const bal = new BigNumber(balance.val.total)
          .dividedBy(10 ** asset.decimals)
          .toNumber();
        setBalance(asset, bal);
      } else {
        if (!address) {
          clearBalances();
          return;
        }
        const chain = evmToViemChainMap[asset.chain];
        if (!chain) return;
        const balance = await getTokenBalance(address, asset);
        setBalance(asset, balance);
      }
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 10000);

    return () => clearInterval(intervalId);
  }, [address, clearBalances, asset, provider, setBalance]);

  return { balances, tokenBalance };
};
