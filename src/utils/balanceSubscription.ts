import BigNumber from "bignumber.js";
import { API } from "../constants/api";

export enum ChainType {
  BITCOIN = "bitcoin",
  EVM = "evm",
  STARKNET = "starknet",
  SOLANA = "solana",
  SUI = "sui",
  TRON = "tron",
}

export type BalanceAsset = {
  asset_id: string;
  asset_name: string;
  chain: string;
  balance: string;
  decimals: number;
};

export type BalanceUpdate = {
  chain: string;
  balances: BalanceAsset[];
};

type BalanceCallback = (balances: Record<string, BigNumber>) => void;

class BalanceSubscription {
  private eventSources: Map<string, EventSource> = new Map();
  private callbacks: Map<string, BalanceCallback> = new Map();
  private balances: Map<string, Record<string, BigNumber>> = new Map();

  /**
   * Subscribe to balance updates for a specific address and chain type
   * @param chainType - The chain type: 'bitcoin', 'evm', 'starknet', 'solana', 'sui', 'tron'
   * @param address - The wallet address
   * @param callback - Callback function that receives updated balances
   * @returns A function to unsubscribe
   */
  subscribe(
    chainType: ChainType,
    address: string,
    callback: BalanceCallback
  ): () => void {
    const key = `${chainType}:${address}`;

    this.callbacks.set(key, callback);

    if (this.eventSources.has(key)) {
      const existingBalances = this.balances.get(key);
      if (existingBalances) {
        callback(existingBalances);
      }
      return () => this.unsubscribe(key);
    }

    const api = API();
    let url: string;

    switch (chainType) {
      case ChainType.BITCOIN:
        url = api.balance.bitcoin(address).toString();
        break;
      case ChainType.EVM:
        url = api.balance.evm(address).toString();
        break;
      case ChainType.STARKNET:
        url = api.balance.starknet(address).toString();
        break;
      case ChainType.SOLANA:
        url = api.balance.solana(address).toString();
        break;
      case ChainType.SUI:
        url = api.balance.sui(address).toString();
        break;
      case ChainType.TRON:
        url = api.balance.tron(address).toString();
        break;
      default:
        throw new Error(`Unsupported chain type: ${chainType}`);
    }

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data: BalanceUpdate = JSON.parse(event.data);
        this.handleBalanceUpdate(key, data);
      } catch (error) {
        console.error("Failed to parse SSE balance data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error(`SSE connection error for ${key}:`, error);

      setTimeout(() => {
        if (this.callbacks.has(key)) {
          this.reconnect(chainType, address);
        }
      }, 5000);
    };
    this.eventSources.set(key, eventSource);

    return () => this.unsubscribe(key);
  }

  private handleBalanceUpdate(key: string, data: BalanceUpdate) {
    const existingBalances = this.balances.get(key) || {};

    const newBalances: Record<string, BigNumber> = {};

    for (const asset of data.balances) {
      const balance = new BigNumber(asset.balance);
      newBalances[asset.asset_id] = balance;
    }

    const updatedBalances = {
      ...existingBalances,
      ...newBalances,
    };

    this.balances.set(key, updatedBalances);

    const callback = this.callbacks.get(key);
    if (callback) {
      callback(updatedBalances);
    }
  }

  private reconnect(chainType: ChainType, address: string) {
    const key = `${chainType}:${address}`;

    const existingSource = this.eventSources.get(key);
    if (existingSource) {
      existingSource.close();
      this.eventSources.delete(key);
    }

    const callback = this.callbacks.get(key);
    if (callback) {
      this.callbacks.delete(key);
      this.subscribe(chainType, address, callback);
    }
  }

  private unsubscribe(key: string) {
    const eventSource = this.eventSources.get(key);
    if (eventSource) {
      eventSource.close();
      this.eventSources.delete(key);
    }

    this.callbacks.delete(key);
    this.balances.delete(key);
  }

  /**
   * Unsubscribe all connections
   */
  unsubscribeAll() {
    this.eventSources.forEach((eventSource) => {
      eventSource.close();
    });

    this.eventSources.clear();
    this.callbacks.clear();
    this.balances.clear();
  }

  /**
   * Get the current balances for a specific key (without subscribing)
   */
  getBalances(
    chainType: ChainType,
    address: string
  ): Record<string, BigNumber> | undefined {
    const key = `${chainType}:${address}`;
    return this.balances.get(key);
  }
}

export const balanceSubscription = new BalanceSubscription();
