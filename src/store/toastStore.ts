import { create } from "zustand";

type ToastType = "success" | "error";

interface ToastState {
  isVisible: boolean;
  content: string;
  link?: string;
  type: ToastType;
  showToast: (type: ToastType, content: string, link?: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  isVisible: false,
  content: "",
  type: "success",
  showToast: (type, content, link) =>
    set({ isVisible: true, type, content, link }),
  hideToast: () => set({ isVisible: false, content: "", link: undefined }),
}));
