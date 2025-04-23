import { Err, Ok, Void } from "@gardenfi/utils";
import { Config, Connector } from "wagmi";
import { ConnectMutateAsync } from "wagmi/query";

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
