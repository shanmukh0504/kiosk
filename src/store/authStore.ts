import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKeys } from "@gardenfi/utils";

type AuthStore = {
  auth: string;
  setAuth: (auth: string) => void;
};

const authStore = create<AuthStore>()(
  persist(
    (set) => ({
      auth: "",
      setAuth: (auth: string) => set({ auth }),
    }),
    {
      name: StoreKeys.AUTH_TOKEN, // Unique name for localStorage key
      getStorage: () => localStorage, // Default storage mechanism
      // `onRehydrateStorage` will run after the state is loaded from localStorage
      //TODO: this might be useful to check if the auth token is still valid
      // onRehydrateStorage: () => (state) => {
      //   if (state?.auth && !verifyAuth(state.auth)) {
      //     // If the auth is invalid, clear it
      //     authStore.setState({ auth: "" });
      //   }
      // },
    },
  ),
);

export default authStore;
