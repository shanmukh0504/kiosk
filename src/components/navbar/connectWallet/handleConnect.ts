import { Config, Connector } from "wagmi";
import { ConnectMutateAsync } from "wagmi/query";
import { checkIfWhitelisted } from "../../../utils/checkIfWhitelisted";
import { WalletClient } from "viem";
import { getWalletClient } from "wagmi/actions";
import { config } from "../../../layout/wagmi/config";
import { Siwe} from "@gardenfi/utils";
import { API } from "../../../constants/api";

export const handleEVMConnect = async (
  connector: Connector,
  connectAsync: ConnectMutateAsync<Config, unknown>
) => {
  try {
    const res = await connectAsync({
      connector,
    });
    const address = res.accounts[0];
    if (!address) return;

    const whitelisted = await checkIfWhitelisted(address);
    if (!whitelisted) {
      return {
        isWhitelisted: false,
        auth: null,
      };
    }

    const walletClient: WalletClient = await getWalletClient(config, {
      connector,
    });
    if (!walletClient) return;

    const auth = new Siwe(API().orderbook, walletClient, {
      store: localStorage,
      domain: window.location.hostname,
    });
    const authToken = await auth.getToken();

    if (authToken.val && !authToken.error) {
      return {
        isWhitelisted: true,
        auth: authToken.val,
      };
    }
  } catch (error) {
    console.warn("error :", error);
    return;
  }
};
