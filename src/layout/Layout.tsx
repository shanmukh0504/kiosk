import { Footer } from "@gardenfi/garden-book";
import { FC, ReactNode, useEffect } from "react";
import { getCurrentTheme } from "../utils/utils";
import { Navbar } from "../components/navbar/Navbar";
import { Modal } from "../components/modal/Modal";
import { Notification } from "../common/Notification";
import { ViewPortListener } from "../common/ViewPortListener";
import { assetInfoStore } from "../store/assetInfoStore";
import { network } from "../constants/constants";

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
    <div className={`${theme} overflow-hidden`}>
      <ViewPortListener />
      <div className="relative z-10 bg-primary">
        <div
          className="fixed inset-0 top-[50%] z-[-10] h-[50%] w-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(188, 237, 220, 0.00) 0%, #BCEDDC 100%)",
          }}
        />
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
