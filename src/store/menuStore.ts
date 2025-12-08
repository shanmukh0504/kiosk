import { create } from "zustand";

interface MenuState {
  openMenuId: string | null;
  setOpenMenu: (id: string | null) => void;
  closeMenu: () => void;
}

export const menuStore = create<MenuState>((set) => ({
  openMenuId: null,
  setOpenMenu: (id) => set({ openMenuId: id }),
  closeMenu: () => set({ openMenuId: null }),
}));
