import axios from "axios";
import { API } from "../constants/api";

export const checkIfWhitelisted = async (address: string) => {
  const lowerCaseAddress = address.toLowerCase();
  
  const storedData = localStorage.getItem("whitelistedAddresses");
  const whitelistedAddresses = storedData ? JSON.parse(storedData) : {};

  if (whitelistedAddresses[lowerCaseAddress] === true) {
    return true;
  }

  try {
    const res = await axios.get<{
      is_whitelisted: boolean;
    }>(API().whitelist(lowerCaseAddress));
    
    whitelistedAddresses[lowerCaseAddress] = res.data.is_whitelisted;
    localStorage.setItem("whitelistedAddresses", JSON.stringify(whitelistedAddresses));
    
    return res.data.is_whitelisted;
  } catch {
    return false;
  }
};
