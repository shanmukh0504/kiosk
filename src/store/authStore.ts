import { create } from "zustand";

type AuthStore = {
  auth: string;
  setAuth: (auth: string) => void;
};

export const authStore = create<AuthStore>()((set) => ({
  auth: "",
  setAuth: (auth: string) => set({ auth }),
}));
