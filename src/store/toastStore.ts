import { create } from "zustand";

type ToastType = "success" | "error" | "needSeed";

interface ToastState {
  isVisible: boolean;
  content: string;
  link?: string;
  type: ToastType;
  staticToasts: {
    needSeed: { isVisible: boolean; content: string; link?: string };
  };
  showToast: (type: ToastType, content: string, link?: string) => void;
  hideToast: () => void;
  showStaticToast: (content: string, link?: string) => void;
  hideStaticToast: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  isVisible: false,
  content: "",
  type: "success",
  staticToasts: {
    needSeed: { isVisible: false, content: "", link: undefined },
  },

  showToast: (type, content, link) => {
    set({
      isVisible: true,
      type,
      content,
      link,
      staticToasts: {
        needSeed: { ...get().staticToasts.needSeed, isVisible: false },
      },
    });
  },

  hideToast: () => {
    const { staticToasts } = get();
    set({
      isVisible: false,
      content: "",
      link: undefined,
      staticToasts: {
        needSeed: {
          ...staticToasts.needSeed,
          isVisible: staticToasts.needSeed.content ? true : false,
        },
      },
    });
  },

  showStaticToast: (content, link) => {
    set({
      staticToasts: {
        needSeed: { isVisible: true, content, link },
      },
    });
  },

  hideStaticToast: () => {
    set({
      staticToasts: {
        needSeed: { isVisible: false, content: "", link: undefined },
      },
    });
  },
}));
