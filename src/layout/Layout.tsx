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

    // Create a UTC timestamp for tomorrow at 14:00 UTC (2 PM)
    const nextUTC2PM = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1, // tomorrow
        14,
        0,
        0,
        0
      )
    );

    const msRemaining = nextUTC2PM.getTime() - now.getTime(); // both are UTC-based
    const hoursRemaining = msRemaining / (1000 * 60 * 60);

    return Math.floor(hoursRemaining);
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
          id="act-2:bloom"
          title={`0 Fees. ${remainingTime} Hours. Unichain. 🦄 `}
          description={`Zero protocol fees on all swaps to Unichain for the next ${remainingTime} hours.`}
          image="https://wbtc-garden.ghost.io/content/images/size/w1000/2025/04/act2-1.png"
          link="https://garden.finance/blog/leveling-up-garden"
        />
        <Footer className={"mt-auto"} />
      </div>
    </div>
  );
};
