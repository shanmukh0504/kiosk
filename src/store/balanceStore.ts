import { create } from "zustand";
import { IOType, network } from "../constants/constants";
import {
  Asset,
  Chain,
  ChainAsset,
  EVMChains,
  isBitcoin,
  isEVM,
  isSolana,
  isStarknet,
  isSui,
} from "@gardenfi/orderbook";
import { BitcoinProvider } from "@gardenfi/core";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { getBalanceMulticall } from "../utils/getBalanceMulticall";
import { IInjectedBitcoinProvider } from "@gardenfi/wallet-connectors";
import {
  getSolanaTokenBalance,
  getStarknetTokenBalance,
  getSuiTokenBalance,
} from "../utils/getTokenBalance";
import { Hex } from "viem";
import { getSpendableBalance } from "../utils/getmaxBtc";
import { getLegacyGasEstimate } from "../utils/getNativeTokenFee";
import { SupportedChains } from "../layout/wagmi/config";
import { getAllWorkingRPCs } from "../utils/rpcUtils";
import { assetInfoStore } from "./assetInfoStore";
import { isAlpenChain } from "../utils/utils";

type BalanceStoreState = {
  balances: Record<string, BigNumber | undefined>;
  workingRPCs: Record<number, string[]>;
  isLoading: boolean;
  isAssetSelectorOpen: {
    isOpen: boolean;
    type: IOType;
  };
  error: string | null;
  setOpenAssetSelector: (type: IOType) => void;
  CloseAssetSelector: () => void;
  fetchAndSetRPCs: () => Promise<void>;
  fetchAndSetEvmBalances: (
    address: string,
    fetchOnlyAsset?: Asset
  ) => Promise<void>;
  balanceFetched: boolean;
  fetchAndSetBitcoinBalance: (
    provider: IInjectedBitcoinProvider,
    address: string
  ) => Promise<void>;
  fetchAndSetStarknetBalance: (address: string) => Promise<void>;
  fetchAndSetSolanaBalance: (address: PublicKey) => Promise<void>;
  fetchAndSetSuiBalance: (address: string) => Promise<void>;
  clearBalances: () => void;
};

export const balanceStore = create<BalanceStoreState>((set, get) => ({
  balanceFetched: false,
  fiatData: {},
  balances: {},
  workingRPCs: {},
  isAssetSelectorOpen: {
    isOpen: false,
    type: IOType.input,
  },
  isLoading: false,
  error: null,
  fetchAndSetRPCs: async () => {
    set({ isLoading: true });
    const workingRPCs = await getAllWorkingRPCs([...SupportedChains]);
    set({ workingRPCs, isLoading: false });
  },
  setOpenAssetSelector: (type) =>
    set({
      isAssetSelectorOpen: {
        isOpen: true,
        type,
      },
    }),

  CloseAssetSelector: () =>
    set({
      isAssetSelectorOpen: {
        type: get().isAssetSelectorOpen.type,
        isOpen: false,
      },
    }),
  fetchAndSetEvmBalances: async (address: string, fetchOnlyAsset?: Asset) => {
    const { workingRPCs } = get();
    const assets = assetInfoStore.getState().assets;
    if (!assets) return;

    let tokensByChain: Partial<Record<Chain, Asset[]>> = {};
    const targetAssets = fetchOnlyAsset
      ? [fetchOnlyAsset]
      : Object.values(assets);

    for (const asset of targetAssets) {
      if (!isEVM(asset.chain)) continue;
      if (!tokensByChain[asset.chain]) tokensByChain[asset.chain] = [];
      const chainAssets = tokensByChain[asset.chain];
      if (chainAssets) {
        chainAssets.push(asset);
      }
    }

    try {
      const balanceResults = await Promise.allSettled(
        Object.entries(tokensByChain).map(async ([chain, assets]) => {
          const tokenAddresses = (assets ?? []).map(
            (asset) => asset?.token?.address
          ) as Hex[];
          const assetKeys = (assets ?? []).map((asset) =>
            ChainAsset.from(asset.id).toString()
          );
          const chainBalances = await getBalanceMulticall(
            tokenAddresses,
            address as Hex,
            chain as EVMChains,
            workingRPCs,
            assetKeys
          );

          const updatedBalances: Record<string, BigNumber | undefined> = {};

          if (!assets) return updatedBalances;

          for (const asset of assets) {
            const orderKey = ChainAsset.from(asset.id).toString();
            let balance = chainBalances[orderKey];

            if (
              balance &&
              balance.gt(0) &&
              isEVM(asset.chain) &&
              asset.token === null
            ) {
              const fee = await getLegacyGasEstimate(
                chain as EVMChains,
                address as `0x${string}`,
                asset?.htlc?.address as `0x${string}`
              );

              if (fee) {
                const feeBN = new BigNumber(fee.gasCost);
                balance = BigNumber.max(balance.minus(feeBN), 0);
              }
            }

            updatedBalances[orderKey] = balance;
          }

          return updatedBalances;
        })
      );

      const finalBalances = balanceResults.reduce((acc, result) => {
        return result.status === "fulfilled"
          ? { ...acc, ...result.value }
          : acc;
      }, {});

      set({ balanceFetched: true });

      set({ balances: { ...get().balances, ...finalBalances } });
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  },

  fetchAndSetBitcoinBalance: async (
    provider: IInjectedBitcoinProvider,
    address: string
  ) => {
    const assets = assetInfoStore.getState().assets;
    if (!assets || !provider) return;

    try {
      const balance = await provider.getBalance();
      if (!balance?.val?.total) return;

      const formattedBalance = new BigNumber(balance.val.confirmed);

      const _provider = new BitcoinProvider(network);

      const feeRate = await _provider.getFeeRates();
      const utxos = await _provider.getUTXOs(address, Number(formattedBalance));
      const spendable = await getSpendableBalance(
        address,
        Number(formattedBalance),
        utxos.length,
        feeRate.fastestFee
      );
      const maxSpendableBalance = spendable.ok ? spendable.val : 0;

      const btcBalance = Object.values(assets)
        .filter((asset) => isBitcoin(asset.chain) && !isAlpenChain(asset.chain))
        .reduce(
          (acc, asset) => {
            acc[ChainAsset.from(asset.id).toString()] = new BigNumber(
              maxSpendableBalance
            );
            return acc;
          },
          {} as Record<string, BigNumber | undefined>
        );

      set({ balances: { ...get().balances, ...btcBalance } });
    } catch {
      /*empty*/
    }
  },

  fetchAndSetStarknetBalance: async (address: string) => {
    const assets = assetInfoStore.getState().assets;
    if (!assets) return;

    const starknetAsset = Object.values(assets).find((asset) =>
      isStarknet(asset.chain)
    );

    if (!starknetAsset) return;

    const starknetBalance: Record<string, BigNumber | undefined> = {};
    const balance = await getStarknetTokenBalance(address, starknetAsset);

    const assetKey = ChainAsset.from(starknetAsset.id).toString();
    starknetBalance[assetKey] = new BigNumber(balance);
    set({ balances: { ...get().balances, ...starknetBalance } });
  },

  fetchAndSetSolanaBalance: async (address: PublicKey) => {
    const assets = assetInfoStore.getState().assets;
    if (!assets) return;

    const solanaAssets = Object.values(assets).filter((asset) =>
      isSolana(asset.chain)
    );

    if (!solanaAssets.length) return;
    const solanaBalance: Record<string, BigNumber | undefined> = {};

    for (const asset of solanaAssets) {
      const balance = await getSolanaTokenBalance(address, asset);
      const assetKey = ChainAsset.from(asset.id).toString();

      // Check if it's native SOL - when tokenAddress equals atomicSwapAddress, it's a native token
      const isNativeSOL = asset.token?.address === asset.htlc?.address;

      if (isNativeSOL) {
        const gas = 0.00380608;
        solanaBalance[assetKey] = new BigNumber(
          Math.max(0, Number((Number(balance) - gas).toFixed(8)))
        );
      } else solanaBalance[assetKey] = new BigNumber(balance);
    }
    set({ balances: { ...get().balances, ...solanaBalance } });
  },

  fetchAndSetSuiBalance: async (address: string) => {
    const assets = assetInfoStore.getState().assets;
    if (!assets) return;

    const suiAsset = Object.values(assets).find((asset) => isSui(asset.chain));

    if (!suiAsset) return;
    const suiBalance: Record<string, BigNumber | undefined> = {};

    const balance = await getSuiTokenBalance(address, suiAsset);
    const assetKey = ChainAsset.from(suiAsset.id).toString();
    suiBalance[assetKey] = new BigNumber(balance);
    set({ balances: { ...get().balances, ...suiBalance } });
  },

  clearBalances: () =>
    set({
      balances: {},
    }),
}));
