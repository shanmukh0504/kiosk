import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode, useEffect } from "react";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification } from "../common/Notification";
import { ViewPortListener } from "../common/ViewPortListener";
import { assetInfoStore } from "../store/assetInfoStore";
import { network, THEMES } from "../constants/constants";
import { viewPortStore } from "../store/viewPortStore";
import { notificationStore } from "../store/notificationStore";

type LayoutProps = {
  children: ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { fetchAndSetAssetsAndChains } = assetInfoStore();
  const { isMobile } = viewPortStore();
  const theme = getCurrentTheme();
  const { fetchNotification } = notificationStore();

  useEffect(() => {
    fetchAndSetAssetsAndChains();
    fetchNotification();
  }, [fetchAndSetAssetsAndChains, fetchNotification]);

  return (
    <div className={`${theme} overflow-hidden text-dark-grey`}>
      <ViewPortListener />
      <div className="relative z-10 bg-primary">
        <div
          className="fixed inset-0 top-[50%] z-[-10] h-[50%] w-full"
          style={{
            background:
              theme === THEMES.swap
                ? "linear-gradient(180deg, rgba(188, 237, 220, 0.00) 0%, #BCEDDC 100%)"
                : "linear-gradient(180deg, rgba(255, 189, 205, 0) 0%, #FFBDCD 100%)",
          }}
        />
        <Modal />
        <div className="min-h-[100vh]">
          <Navbar />
          {children}
        </div>
        {!isMobile && <Notification />}
        <Footer className={"mt-auto"} network={network} />
      </div>
    </div>
  );
};
