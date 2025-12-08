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

const LayoutContent: FC<LayoutProps> = ({ children }) => {
  const { fetchAndSetAssetsAndChains } = assetInfoStore();
  const { isMobile } = viewPortStore();
  const theme = getCurrentTheme();
  const { fetchNotification } = notificationStore();

  useEffect(() => {
    fetchAndSetAssetsAndChains();
    fetchNotification();
  }, [fetchAndSetAssetsAndChains, fetchNotification]);

  return (
    <div className={`${theme} overflow-hidden overscroll-none text-dark-grey`}>
      <ViewPortListener />
      <div className="relative z-10 bg-primary">
        <div
          className="fixed bottom-0 -z-10 h-full max-h-[612px] w-screen origin-bottom overflow-hidden opacity-60"
          style={{
            background:
              theme === THEMES.swap
                ? "linear-gradient(180deg, rgba(188, 237, 220, 0) 0%, #BCEDDC 100%)"
                : "linear-gradient(180deg, rgba(255, 189, 205, 0) 0%, #FFBDCD 100%)",
          }}
        />
        <Modal />
        <Navbar />
        {children}
        {!isMobile && <Notification />}
        <Footer
          className={"mt-auto"}
          maskUrl="https://garden.imgix.net/footer/maskRect.svg"
          network={network}
        />
      </div>
    </div>
  );
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  return <LayoutContent>{children}</LayoutContent>;
};
