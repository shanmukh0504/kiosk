import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode, useEffect } from "react";
import { Orb } from "../common/Orb";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification } from "../common/Notification";
import { ViewPortListener } from "../common/ViewPortListener";
import { assetInfoStore } from "../store/assetInfoStore";

type LayoutProps = {
  children: ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { fetchAndSetAssetsAndChains } = assetInfoStore();
  const theme = getCurrentTheme();

  useEffect(() => {
    fetchAndSetAssetsAndChains();
  }, [fetchAndSetAssetsAndChains]);

  return (
    <div className={`${theme} relative overflow-hidden bg-opacity-50`}>
      <div className="absolute inset-0 z-[-30] bg-primary"></div>
      <Orb />
      <ViewPortListener />
      <div className="relative z-10 bg-white bg-opacity-50">
        <Modal />
        <div className="min-h-[100vh]">
          <Navbar />
          {children}
        </div>
        <Notification
          id="unichain-launch"
          title="We are now live on Unichain! 🦄"
          description="Swap in and out of Unichain in as little as 30 seconds."
          image="https://wbtc-garden.ghost.io/content/images/2025/05/Unichain-2.png"
          link="https://garden.finance/blog/bitcoin-to-unichain-in-30-seconds-2"
        />
        <Footer className={"mt-auto"} />
      </div>
    </div>
  );
};
