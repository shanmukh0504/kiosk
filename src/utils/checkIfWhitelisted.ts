import axios from "axios";
import { API } from "../constants/api";

export const checkIfWhitelisted = async (address: string) => {
  try {
    const res = await axios.get<{
      is_whitelisted: boolean;
    }>(API().whitelist(address.toLowerCase()));
    return res.data.is_whitelisted;
  } catch {
    return false;
  }
};
