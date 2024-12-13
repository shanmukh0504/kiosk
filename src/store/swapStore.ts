import { create } from "zustand";
import { IOType, network } from "../constants/constants";
import { Asset, Chains, MatchedOrder } from "@gardenfi/orderbook";

export type TokenPrices = {
  input: string;
  output: string;
};

export type FetchingQuote = {
  input: boolean;
  output: boolean;
};

type SwapState = {
  inputAsset?: Asset;
  outputAsset?: Asset;
  inputAmount: string;
  outputAmount: string;
  btcAddress: string;
  swapInProgress: { isOpen: boolean; order: MatchedOrder | null };
  isSwapping: boolean;
  strategy: string;
  tokenPrices: TokenPrices;
  error: string;
  isFetchingQuote: FetchingQuote;
  setTokenPrices: (tokenPrices: TokenPrices) => void;
  setIsSwapping: (isSwapping: boolean) => void;
  setStrategy: (strategy: string) => void;
  setAsset: (ioType: IOType, asset: Asset) => void;
  setAmount: (ioType: IOType, amount: string) => void;
  setBtcAddress: (btcAddress: string) => void;
  swapAssets: () => void;
  setSwapInProgress: (confirmSwap: {
    isOpen: boolean;
    order: MatchedOrder;
  }) => void;
  setError: (error: string) => void;
  setIsFetchingQuote: (isFetchingQuote: FetchingQuote) => void;
  closeSwapInProgress: () => void;
  clearSwapState: () => void;
};

const BTC = {
  name: "Bitcoin",
  decimals: 8,
  symbol: "BTC",
  logo: "https://garden-finance.imgix.net/token-images/bitcoin.svg",
  tokenAddress: "primary",
  atomicSwapAddress: "primary",
  chain: network === "mainnet" ? Chains.bitcoin : Chains.bitcoin_testnet,
};

export const swapStore = create<SwapState>((set) => ({
  inputAsset: BTC,
  inputAmount: "",
  outputAmount: "",
  btcAddress: "",
  swapInProgress: {
    isOpen: true,
    order: {
      created_at: "2024-12-12T11:13:01.777938Z",
      updated_at: "2024-12-12T11:13:01.777938Z",
      deleted_at: null,
      source_swap: {
        created_at: "2024-12-12T11:13:01.753846Z",
        updated_at: "2024-12-12T12:49:45.601908Z",
        deleted_at: null,
        swap_id:
          "tb1pfkhvlk9307hycmua58waul6pl6ek7afsz5yxrll3w90vdyazglks5x8v89",
        chain: "bitcoin_testnet",
        asset: "primary",
        initiator:
          "e39ec379ccddf417b54d68ed96aa580ad3177abeabe4f6da4b9fe092ad6bef6d",
        redeemer:
          "460f2e8ff81fc4e0a8e6ce7796704e3829e3e3eedb8db9390bdc51f4f04cf0a6",
        timelock: 144,
        filled_amount: "1000000",
        amount: "1000000",
        secret_hash:
          "2d8697807567bbbe9fa7e7a6f493d65d654f2937f60ba1d532cd8eab1f172bfe",
        secret:
          "02ccc88fd33f394fea2aee7f3339509d9890b4bde9ee693c0261d19c935a985b",
        initiate_tx_hash:
          "208f6f2398c66a2d7c65fcf39ce43129e8b271ab35a14e7c7ee7473779e94504:57657",
        redeem_tx_hash:
          "4120171e06dc4f3626ca9c1bd0f39b9171b943c94740dab22178128940c85c4e",
        refund_tx_hash: "",
        initiate_block_number: "57657",
        redeem_block_number: "57661",
        refund_block_number: "0",
        required_confirmations: 1,
      },
      destination_swap: {
        created_at: "2024-12-12T11:13:01.753846Z",
        updated_at: "2024-12-12T12:32:57.721831Z",
        deleted_at: null,
        swap_id:
          "aaf5f09742da37d7dfc2563e6b243b54ceb4315e3dd0792a6d83f8d78d2888b8",
        chain: "arbitrum_sepolia",
        asset: "0x1cd0bBd55fD66B4C5F7dfE434eFD009C09e628d1",
        initiator: "0x661bA32eb5f86CaB358DDbB7F264b10c5825e2dd",
        redeemer: "0xd53D4f100AaBA314bF033f99f86a312BfbdDF113",
        timelock: 600,
        filled_amount: "997000",
        amount: "997000",
        secret_hash:
          "2d8697807567bbbe9fa7e7a6f493d65d654f2937f60ba1d532cd8eab1f172bfe",
        secret:
          "02ccc88fd33f394fea2aee7f3339509d9890b4bde9ee693c0261d19c935a985b",
        initiate_tx_hash:
          "0xb08ba18f801c2fbf0c88221da7578b034add5d1c95c57cc60cd680c52af9354e",
        redeem_tx_hash:
          "0x1b4b83af6bc57d33eef01cadb4b14823cbb2520f799d35879cbb6a77d495cdd7",
        refund_tx_hash: "",
        initiate_block_number: "7263542",
        redeem_block_number: "7263838",
        refund_block_number: "0",
        required_confirmations: 0,
      },
      create_order: {
        created_at: "2024-12-12T11:13:01.777938Z",
        updated_at: "2024-12-12T11:13:01.777938Z",
        deleted_at: null,
        create_id:
          "941b2d489db9780f268bb59995a3078482c166472881e9392cb7955c6f061975",
        block_number: "7263462",
        source_chain: "bitcoin_testnet",
        destination_chain: "arbitrum_sepolia",
        source_asset: "primary",
        destination_asset: "0x1cd0bBd55fD66B4C5F7dfE434eFD009C09e628d1",
        initiator_source_address:
          "e39ec379ccddf417b54d68ed96aa580ad3177abeabe4f6da4b9fe092ad6bef6d",
        initiator_destination_address:
          "0xd53D4f100AaBA314bF033f99f86a312BfbdDF113",
        source_amount: "1000000",
        destination_amount: "997000",
        fee: "3.01273678156885937880",
        nonce: "109",
        min_destination_confirmations: 0,
        timelock: 144,
        secret_hash:
          "2d8697807567bbbe9fa7e7a6f493d65d654f2937f60ba1d532cd8eab1f172bfe",
        additional_data: {
          strategy_id: "btryasd1",
          bitcoin_optional_recipient:
            "tb1qxtztdl8qn24axe7dnvp75xgcns6pl5ka9tzjru",
          input_token_price: 100424.55938562864,
          output_token_price: 100424.55938562864,
          sig: "d7f76306c3954ce9b647cedf080bf3b99afc415993c47f887fb5089b5147316b35efe221218fcec847c9bde3d752857a2f5398049320bf65ecbd7042b7be0aa31c",
          deadline: 1734005578,
          instant_refund_tx_bytes:
            "020000000001010445e9793747e77e7c4ea135ab71b2e82931e49cf3fc657c2d6ac698236f8f200000000000ffffffff017a3f0f000000000016001432c4b6fce09aabd367cd9b03ea19189c341fd2dd044077479a6c49a861ee1d01aa87456d3562999334bb81dc59a2ef55e349db3c708b4242ffa406361f397dbb4994039122749fb3c63378ab81499b635793cd38767f4077479a6c49a861ee1d01aa87456d3562999334bb81dc59a2ef55e349db3c708b4242ffa406361f397dbb4994039122749fb3c63378ab81499b635793cd38767f4620e39ec379ccddf417b54d68ed96aa580ad3177abeabe4f6da4b9fe092ad6bef6dac20460f2e8ff81fc4e0a8e6ce7796704e3829e3e3eedb8db9390bdc51f4f04cf0a6ba529c61c02160e11a135f94e536a5b222e5d09fd9db1be5f5f5e753920290c0410cf388f0b233c1e5ac6de54cf887d9afcf273e1fe97b873f1e0d54b59181740e78b11b2fc7190609dc7a07d499936e1a77bf667c4ca576b34b54542005f856584eabd6f200000000",
        },
      },
    },
  },
  isSwapping: false,
  strategy: "",
  tokenPrices: {
    input: "0",
    output: "0",
  },
  error: "",
  isFetchingQuote: {
    input: false,
    output: false,
  },
  setAsset: (ioType, asset) => {
    set((state) => ({
      ...state,
      [ioType === IOType.input ? "inputAsset" : "outputAsset"]: asset,
    }));
  },
  setAmount: (ioType, amount) => {
    set((state) => ({
      ...state,
      [ioType === IOType.input ? "inputAmount" : "outputAmount"]: amount,
    }));
  },
  setBtcAddress: (btcAddress) => {
    set((state) => ({
      ...state,
      btcAddress,
    }));
  },
  swapAssets: () => {
    set((state) => {
      const newInputAmount =
        !state.outputAmount || state.outputAmount === "0"
          ? ""
          : state.outputAmount;

      const newOutputAmount =
        !state.inputAmount || state.inputAmount === "0"
          ? ""
          : state.outputAmount;
      return {
        ...state,
        inputAsset: state.outputAsset,
        outputAsset: state.inputAsset,
        inputAmount: newInputAmount,
        outputAmount: newOutputAmount,
      };
    });
  },
  setSwapInProgress: (swapInProgress) => {
    set(
      (state) =>
        (state = {
          ...state,
          swapInProgress,
        })
    );
  },
  setIsSwapping: (isSwapping) => {
    set({ isSwapping });
  },
  setStrategy: (strategy) => {
    set({ strategy });
  },
  setTokenPrices: (tokenPrices) => {
    set({ tokenPrices });
  },
  setError: (error) => {
    set({ error });
  },
  setIsFetchingQuote: (isFetchingQuote) => {
    set({ isFetchingQuote });
  },
  closeSwapInProgress: () => {
    set({ swapInProgress: { isOpen: false, order: null } });
  },
  clearSwapState: () => {
    set({
      inputAmount: "",
      outputAmount: "",
      btcAddress: "",
      swapInProgress: { isOpen: false, order: null },
      outputAsset: undefined,
      inputAsset: BTC,
      isSwapping: false,
      strategy: "",
      tokenPrices: {
        input: "0",
        output: "0",
      },
      error: "",
      isFetchingQuote: {
        input: false,
        output: false,
      },
    });
  },
}));
