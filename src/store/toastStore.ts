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
  showStaticToast: (type: "needSeed", content: string, link?: string) => void;
  hideStaticToast: (type: "needSeed") => void;
  setStaticToastVisibility: (type: "needSeed", isVisible: boolean) => void;
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
  showStaticToast: (type, content, link) => {
    set({
      staticToasts: {
        ...get().staticToasts,
        [type]: { isVisible: true, content, link: link ?? undefined },
      },
    });
  },
  hideStaticToast: (type) => {
    set({
      staticToasts: {
        ...get().staticToasts,
        [type]: { isVisible: false, content: "", link: undefined },
      },
    });
  },
  setStaticToastVisibility: (type, isVisible) => {
    set({
      staticToasts: {
        ...get().staticToasts,
        [type]: { ...get().staticToasts[type], isVisible },
      },
    });
  },
}));
