import { createPortal } from "react-dom";
import { ReactNode } from "react";

export const Portal = ({ children }: { children: ReactNode }) => {
  if (typeof window === "undefined") return null;
  let el = document.getElementById("portal-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "portal-root";
    document.body.appendChild(el);
  }
  return createPortal(children, el);
};
