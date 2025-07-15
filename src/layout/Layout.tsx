import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode, useEffect } from "react";
import { Orb } from "../common/Orb";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification } from "../common/Notification";
import { ViewPortListener } from "../common/ViewPortListener";
import { assetInfoStore } from "../store/assetInfoStore";
import { network } from "../constants/constants";
import { MiniAppProvider, useMiniApp } from "./MiniAppContextProvider";

type LayoutProps = {
  children: ReactNode;
};

const LayoutContent: FC<LayoutProps> = ({ children }) => {
  const { fetchAndSetAssetsAndChains } = assetInfoStore();
  const { isInMiniApp } = useMiniApp();
  const theme = getCurrentTheme();

  useEffect(() => {
    fetchAndSetAssetsAndChains();
  }, [fetchAndSetAssetsAndChains]);

  return (
    <div
      className={`${theme} relative overflow-hidden bg-opacity-50 ${isInMiniApp ? "mini-app-container" : ""}`}
    >
      <div className="absolute inset-0 z-[-30] bg-primary"></div>
      <Orb />
      <ViewPortListener />
      <div className="relative z-10 bg-white bg-opacity-50">
        <Modal />
        <div className="min-h-[100vh]">
          <Navbar />
          {children}
        </div>
        <Notification />
        <Footer className={"mt-auto"} network={network} />
      </div>
    </div>
  );
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <MiniAppProvider>
      <LayoutContent>{children}</LayoutContent>
    </MiniAppProvider>
  );
};
