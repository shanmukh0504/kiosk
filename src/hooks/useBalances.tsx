import { useEffect, useMemo } from "react";
import {
  Asset,
  isBitcoin,
  isStarknet,
  isEVM,
  isSolana,
  // isSolana,
} from "@gardenfi/orderbook";
import { evmToViemChainMap } from "@gardenfi/core";
import { useEVMWallet } from "./useEVMWallet";
import {
  getTokenBalance,
  getStarknetTokenBalance,
} from "../utils/getTokenBalance";
import { useBitcoinWallet } from "@gardenfi/wallet-connectors";
import BigNumber from "bignumber.js";
import { balanceStore } from "../store/balanceStore";
import { useStarknetWallet } from "./useStarknetWallet";
import { useSolanaWallet } from "./useSolanaWallet";

export const useBalances = (asset: Asset | undefined) => {
  const { balances, setBalance, clearBalances } = balanceStore();
  const { address } = useEVMWallet();
  const { provider } = useBitcoinWallet();
  const { starknetAccount } = useStarknetWallet();
  const { solanaAnchorProvider } = useSolanaWallet();

  const tokenBalance = useMemo(
    () => balances[`${asset?.chain}_${asset?.tokenAddress.toLowerCase()}`],
    [balances, asset]
  );

  useEffect(() => {
    if (!asset) return;

    const fetchBalance = async () => {
      if (isBitcoin(asset.chain)) {
        if (!provider) return;
        const balance = await provider.getBalance();
        if (balance.error || !balance.val) return;

        const bal = new BigNumber(balance.val.total)
          .dividedBy(10 ** asset.decimals)
          .toNumber();
        setBalance(asset, bal);
      } else if (isStarknet(asset.chain)) {
        if (!starknetAccount) {
          clearBalances();
          return;
        }
        const balance = await getStarknetTokenBalance(
          starknetAccount.address,
          asset
        );
        setBalance(asset, balance);
      } else if (isEVM(asset.chain)) {
        if (!address) {
          clearBalances();
          return;
        }
        const chain = evmToViemChainMap[asset.chain];
        if (!chain) return;
        const balance = await getTokenBalance(address, asset);
        setBalance(asset, balance);
      } else if (isSolana(asset.chain)) {
        if (!solanaAnchorProvider) {
          clearBalances();
          return;
        }
        const balance = await solanaAnchorProvider.connection.getBalance(
          solanaAnchorProvider.publicKey
        );
        const bal = new BigNumber(balance)
          .dividedBy(10 ** asset.decimals)
          .toNumber();
        setBalance(asset, bal);
      }
    };

    fetchBalance();
    const intervalId = setInterval(fetchBalance, 10000);

    return () => clearInterval(intervalId);
  }, [
    address,
    clearBalances,
    asset,
    provider,
    setBalance,
    starknetAccount,
    solanaAnchorProvider,
  ]);

  return { balances, tokenBalance };
};
