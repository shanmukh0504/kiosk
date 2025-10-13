import { Err, Ok, Void } from "@gardenfi/utils";
import { Config, Connector } from "wagmi";
import {
  Connector as StarknetConnector,
  ConnectVariables,
  RequestResult,
  UseSwitchChainArgs,
} from "@starknet-react/core";
import { ConnectMutateAsync } from "wagmi/query";
import { STARKNET_CONFIG } from "@gardenfi/core";
import { network } from "../../../constants/constants";
import { UseMutateAsyncFunction } from "@tanstack/react-query";

export const handleEVMConnect = async (
  connector: Connector,
  connectAsync: ConnectMutateAsync<Config, unknown>
) => {
  try {
    await connectAsync({
      connector,
    });
    return Ok(Void);
  } catch (error) {
    return Err(error);
  }
};

export const handleStarknetConnect = async (
  WalletConnector: StarknetConnector,
  connectAsync: (args?: ConnectVariables) => Promise<void>,
  switchChain: (
    args?: UseSwitchChainArgs
  ) => Promise<RequestResult<"wallet_switchStarknetChain">>,
  disconnect: UseMutateAsyncFunction<void, Error, void, unknown>
) => {
  try {
    await connectAsync({
      connector: WalletConnector,
    });
    const chainId = WalletConnector && (await WalletConnector.chainId());
    const targetChainId = STARKNET_CONFIG[network].chainId;
    const currentChainIdHex = chainId && "0x" + chainId.toString(16);
    if (
      currentChainIdHex &&
      currentChainIdHex.toLowerCase() !== targetChainId.toLowerCase()
    ) {
      try {
        await switchChain({ chainId: targetChainId });
      } catch {
        await disconnect();
      }
    }
    return Ok(Void);
  } catch (error) {
    return Err(error);
  }
};
