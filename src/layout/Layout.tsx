import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode, useEffect, useMemo } from "react";
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

  const remainingTime = useMemo(() => {
    const now = new Date();
    const target = new Date(Date.UTC(2025, 4, 21, 14, 0, 0)); // 21 May 2025, 2PM UTC

    const msRemaining = target.getTime() - now.getTime();
    const hoursRemaining = msRemaining / (1000 * 60 * 60);

    return Math.max(0, Math.floor(hoursRemaining)); // never go below 0
  }, []);

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
          id="unichain-noFees"
          title="Swap to Unichain, pay no fees! 🦄"
          description={`Zero protocol fees on all swaps to Unichain for the next ${remainingTime} hours.`}
          image="/ZeroFees.png"
          link="https://garden.finance/blog/bitcoin-to-unichain-in-30-seconds-2"
        />
        <Footer className={"mt-auto"} />
      </div>
    </div>
  );
};
